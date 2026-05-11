using System.Diagnostics;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;
using Portfolio.Api.Models;
using Portfolio.Api.Options;
using Portfolio.Api.Services.Anthropic;

namespace Portfolio.Api.Services;

/// <summary>
/// Calls the Anthropic Messages API with streaming + tool use enabled and
/// forwards events to the response body as newline-delimited JSON (see
/// <see cref="ChatEvent"/>).
/// </summary>
/// <remarks>
/// Polly retries apply only to <see cref="HttpClient.SendAsync"/> before the response body is read;
/// we use <see cref="HttpCompletionOption.ResponseHeadersRead"/> so transient failures retry a full POST.
/// </remarks>
public sealed class AnthropicStreamService(
    IHttpClientFactory httpClientFactory,
    IOptions<AnthropicOptions> optionsAccessor
) : IAgenticChatRunner
{
    private const string MessagesApiUrl = "https://api.anthropic.com/v1/messages";
    private const string AnthropicVersionHeader = "2023-06-01";
    private const int MaxRounds = 5;
    private const int MaxRoundsWithReflection = 6;
    private static readonly TimeSpan ToolHandlerTimeout = TimeSpan.FromSeconds(60);

    private readonly AnthropicOptions _options = optionsAccessor.Value;

    /// <inheritdoc />
    public Task RunAsync(
        IReadOnlyList<ChatMessageDto> messages,
        ResumeTools tools,
        Stream responseBody,
        NdjsonStreamFlags flags,
        CancellationToken cancellationToken
    ) => StreamChatCoreAsync(messages, tools, responseBody, flags, cancellationToken);

    /// <summary>Runs with default stream flags (backward-compatible entry for callers that do not pass flags).</summary>
    public Task StreamChatAsync(
        IReadOnlyList<ChatMessageDto> messages,
        ResumeTools tools,
        Stream responseBody,
        CancellationToken cancellationToken
    ) => StreamChatCoreAsync(messages, tools, responseBody, NdjsonStreamFlags.Default, cancellationToken);

    private async Task StreamChatCoreAsync(
        IReadOnlyList<ChatMessageDto> messages,
        ResumeTools tools,
        Stream responseBody,
        NdjsonStreamFlags flags,
        CancellationToken cancellationToken
    )
    {
        if (string.IsNullOrWhiteSpace(_options.ApiKey))
            throw new InvalidOperationException("Anthropic API key is not configured.");

        var ndjson = new NdjsonWriter(responseBody);
        var system = SystemPromptLoader.Load("chat");
        var reflectionAppendix = flags.ReflectionPlannerEnabled ? ChatReflectionPrompts.PlannerAppendix : null;
        var maxRounds = flags.ReflectionPlannerEnabled ? MaxRoundsWithReflection : MaxRounds;

        var conversation = new List<object>(
            messages.Select(m => (object)new { role = m.Role, content = m.Content })
        );

        var totalInput = 0;
        var totalOutput = 0;
        // For accurate cost estimation we need to separate normal input tokens from
        // prompt-cached tokens (cache write + cache read billing).
        var baseInputTokens = 0;
        var cacheCreationInputTokens = 0;
        var cacheReadInputTokens = 0;
        var sawAnyUsage = false;

        try
        {
            for (var round = 0; round < maxRounds; round++)
            {
                var sw = Stopwatch.StartNew();
                using var llmActivity = ChatActivitySourceHolder.Source.StartActivity("llm.round");
                llmActivity?.SetTag("chat.round", round);

                AnthropicRoundResult outcome;
                try
                {
                    outcome = await RunRoundAsync(
                        conversation,
                        system,
                        reflectionAppendix,
                        flags,
                        ndjson,
                        cancellationToken
                    );
                }
                finally
                {
                    sw.Stop();
                    llmActivity?.SetTag("duration_ms", sw.Elapsed.TotalMilliseconds);
                }

                if (flags.EmitTraceSpans)
                {
                    var attrs = JsonSerializer.SerializeToElement(
                        new { stopReason = outcome.StopReason, toolCalls = outcome.ToolUseCalls.Count }
                    );
                    await ndjson.WriteAsync(
                        new TraceSpanChatEvent("llm.round", round, sw.Elapsed.TotalMilliseconds, attrs),
                        cancellationToken
                    );
                }

                if (flags.EmitUsageEvents && outcome.TokenUsage is { } u)
                {
                    AccumulateTotals(
                        u,
                        ref totalInput,
                        ref totalOutput,
                        ref baseInputTokens,
                        ref cacheCreationInputTokens,
                        ref cacheReadInputTokens,
                        ref sawAnyUsage
                    );
                    var est = EstimateRoundCost(u);
                    await ndjson.WriteAsync(
                        new UsageRoundChatEvent(
                            round,
                            u.InputTokens,
                            u.OutputTokens,
                            u.CacheCreationInputTokens,
                            u.CacheReadInputTokens,
                            est
                        ),
                        cancellationToken
                    );
                }

                conversation.Add(AnthropicConversationPayload.BuildAssistantMessage(outcome.Blocks));

                if (outcome.StopReason != "tool_use" || outcome.ToolUseCalls.Count == 0)
                {
                    if (flags.EmitUsageEvents && sawAnyUsage)
                    {
                        await ndjson.WriteAsync(
                            new UsageTotalChatEvent(
                                totalInput,
                                totalOutput,
                                EstimateTotalCost(
                                    baseInputTokens,
                                    totalOutput,
                                    cacheCreationInputTokens,
                                    cacheReadInputTokens
                                )
                            ),
                            cancellationToken
                        );
                    }

                    await ndjson.WriteAsync(new DoneChatEvent(), cancellationToken);
                    return;
                }

                var toolResultBlocks = await RunToolsAsync(
                    outcome.ToolUseCalls,
                    tools,
                    ndjson,
                    flags,
                    round,
                    cancellationToken
                );
                conversation.Add(new { role = "user", content = toolResultBlocks });
            }

            if (flags.EmitUsageEvents && sawAnyUsage)
            {
                await ndjson.WriteAsync(
                    new UsageTotalChatEvent(
                        totalInput,
                        totalOutput,
                        EstimateTotalCost(baseInputTokens, totalOutput, cacheCreationInputTokens, cacheReadInputTokens)
                    ),
                    cancellationToken
                );
            }

            await ndjson.WriteAsync(new DoneChatEvent(), cancellationToken);
        }
        catch (OperationCanceledException)
        {
            throw;
        }
        catch (Exception ex)
        {
            try
            {
                await ndjson.WriteAsync(new ErrorChatEvent(ex.Message), cancellationToken);
                await ndjson.WriteAsync(new DoneChatEvent(), cancellationToken);
            }
            catch
            {
                // If the client disconnected, ignore secondary failures.
            }

            throw;
        }
    }

    private static void AccumulateTotals(
        RoundTokenUsage u,
        ref int totalInput,
        ref int totalOutput,
        ref int baseInputTokens,
        ref int cacheCreationInputTokens,
        ref int cacheReadInputTokens,
        ref bool sawAnyUsage
    )
    {
        if (u.InputTokens is { } i)
        {
            totalInput += i;
            baseInputTokens += i;
            sawAnyUsage = true;
        }

        if (u.OutputTokens is { } o)
        {
            totalOutput += o;
            sawAnyUsage = true;
        }

        if (u.CacheCreationInputTokens is { } cc)
        {
            totalInput += cc;
            cacheCreationInputTokens += cc;
            sawAnyUsage = true;
        }

        if (u.CacheReadInputTokens is { } cr)
        {
            totalInput += cr;
            cacheReadInputTokens += cr;
            sawAnyUsage = true;
        }
    }

    private decimal? EstimateRoundCost(RoundTokenUsage u)
    {
        decimal? sum = null;

        // AnthropicPayloadBuilder sets cache_control:{ type:"ephemeral" } on system + some tools.
        // When no explicit ttl is provided, "ephemeral" defaults to 5-minute TTL, so we apply
        // the 5m cache pricing multipliers:
        // - cache writes: 1.25x base input
        // - cache reads: 0.1x base input
        const decimal CacheWriteMultiplier5m = 1.25m;
        const decimal CacheReadMultiplier = 0.1m;

        if (_options.EstimatedInputUsdPerMillionTokens is { } inRate)
        {
            if (u.InputTokens is { } it)
                sum = (sum ?? 0) + inRate * it / 1_000_000m;

            if (u.CacheCreationInputTokens is { } cc)
                sum = (sum ?? 0) + inRate * CacheWriteMultiplier5m * cc / 1_000_000m;

            if (u.CacheReadInputTokens is { } cr)
                sum = (sum ?? 0) + inRate * CacheReadMultiplier * cr / 1_000_000m;
        }

        if (_options.EstimatedOutputUsdPerMillionTokens is { } outRate && u.OutputTokens is { } ot)
            sum = (sum ?? 0) + outRate * ot / 1_000_000m;

        return sum;
    }

    private decimal? EstimateTotalCost(
        int baseInputTokens,
        int outputTokens,
        int cacheCreationInputTokens,
        int cacheReadInputTokens
    )
    {
        decimal? sum = null;

        // See EstimateRoundCost() for cache multipliers.
        const decimal CacheWriteMultiplier5m = 1.25m;
        const decimal CacheReadMultiplier = 0.1m;

        if (_options.EstimatedInputUsdPerMillionTokens is { } inRate)
        {
            sum = (sum ?? 0) + inRate * baseInputTokens / 1_000_000m;

            if (cacheCreationInputTokens > 0)
                sum = (sum ?? 0) + inRate * CacheWriteMultiplier5m * cacheCreationInputTokens / 1_000_000m;

            if (cacheReadInputTokens > 0)
                sum = (sum ?? 0) + inRate * CacheReadMultiplier * cacheReadInputTokens / 1_000_000m;
        }

        if (_options.EstimatedOutputUsdPerMillionTokens is { } outRate)
            sum = (sum ?? 0) + outRate * outputTokens / 1_000_000m;

        return sum;
    }

    private async Task<List<object>> RunToolsAsync(
        IReadOnlyList<AnthropicToolUseCall> toolCalls,
        ResumeTools tools,
        NdjsonWriter ndjson,
        NdjsonStreamFlags flags,
        int round,
        CancellationToken cancellationToken
    )
    {
        var results = new List<object>();
        foreach (var call in toolCalls)
        {
            JsonElement output;
            string? error = null;
            var sw = Stopwatch.StartNew();
            using var act = ChatActivitySourceHolder.Source.StartActivity("tool." + call.Name);
            act?.SetTag("tool.name", call.Name);
            act?.SetTag("chat.round", round);

            try
            {
                using var toolCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
                toolCts.CancelAfter(ToolHandlerTimeout);
                output = await tools.RunAsync(call.Name, call.Input, toolCts.Token);
            }
            catch (Exception ex)
            {
                error = ex.Message;
                output = JsonSerializer.SerializeToElement(new { error = ex.Message });
            }
            finally
            {
                sw.Stop();
                act?.SetTag("duration_ms", sw.Elapsed.TotalMilliseconds);
                if (flags.EmitTraceSpans)
                {
                    var attrs = CappedToolTraceAttributes(call.Name, call.Input);
                    await ndjson.WriteAsync(
                        new TraceSpanChatEvent($"tool.{call.Name}", round, sw.Elapsed.TotalMilliseconds, attrs),
                        cancellationToken
                    );
                }
            }

            await ndjson.WriteAsync(new ToolResultChatEvent(call.Id, output, error), cancellationToken);

            results.Add(new
            {
                type = "tool_result",
                tool_use_id = call.Id,
                content = JsonSerializer.Serialize(output),
                is_error = error is not null,
            });
        }

        return results;
    }

    private static JsonElement? CappedToolTraceAttributes(string name, JsonElement input)
    {
        var raw = input.GetRawText();
        const int max = 2048;
        if (raw.Length > max) raw = raw[..max] + "…";
        return JsonSerializer.SerializeToElement(new { name, inputPreview = raw });
    }

    private async Task<AnthropicRoundResult> RunRoundAsync(
        IReadOnlyList<object> conversation,
        string system,
        string? reflectionAppendix,
        NdjsonStreamFlags flags,
        NdjsonWriter ndjson,
        CancellationToken cancellationToken
    )
    {
        var payload = AnthropicPayloadBuilder.Build(
            _options,
            conversation,
            system,
            flags.UsePromptCaching,
            reflectionAppendix
        );
        var json = JsonSerializer.Serialize(payload);

        var client = httpClientFactory.CreateClient("anthropic");
        using var request = new HttpRequestMessage(HttpMethod.Post, MessagesApiUrl);
        request.Headers.TryAddWithoutValidation("x-api-key", _options.ApiKey);
        request.Headers.TryAddWithoutValidation("anthropic-version", AnthropicVersionHeader);
        request.Content = new StringContent(json, Encoding.UTF8, "application/json");

        using var response = await client.SendAsync(
            request,
            HttpCompletionOption.ResponseHeadersRead,
            cancellationToken
        );

        if (!response.IsSuccessStatusCode)
        {
            var err = await response.Content.ReadAsStringAsync(cancellationToken);
            throw new HttpRequestException($"Anthropic API error {(int)response.StatusCode}: {err}");
        }

        await using var upstream = await response.Content.ReadAsStreamAsync(cancellationToken);
        return await AnthropicSseRoundParser.ParseAsync(upstream, ndjson, cancellationToken);
    }
}
