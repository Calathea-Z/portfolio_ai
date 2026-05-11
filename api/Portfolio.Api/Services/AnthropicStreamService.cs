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
/// Implements the agentic loop: stream a round, collect any <c>tool_use</c>
/// blocks, run them via <see cref="ResumeTools"/>, append <c>tool_result</c>
/// blocks back to the conversation, and stream the next round until the model
/// stops with <c>stop_reason != "tool_use"</c> or we hit <see cref="MaxRounds"/>.
/// SSE parsing lives in <see cref="AnthropicSseRoundParser"/>.
/// </remarks>
public sealed class AnthropicStreamService(
    IHttpClientFactory httpClientFactory,
    IOptions<AnthropicOptions> optionsAccessor
)
{
    private const string MessagesApiUrl = "https://api.anthropic.com/v1/messages";
    private const string AnthropicVersionHeader = "2023-06-01";
    private const int MaxRounds = 5;

    private readonly AnthropicOptions _options = optionsAccessor.Value;

    /// <summary>
    /// Runs the agentic chat loop and streams <see cref="ChatEvent"/>s into
    /// <paramref name="responseBody"/>.
    /// </summary>
    public async Task StreamChatAsync(
        IReadOnlyList<ChatMessageDto> messages,
        ResumeTools tools,
        Stream responseBody,
        CancellationToken cancellationToken
    )
    {
        if (string.IsNullOrWhiteSpace(_options.ApiKey))
            throw new InvalidOperationException("Anthropic API key is not configured.");

        var ndjson = new NdjsonWriter(responseBody);
        var system = SystemPromptLoader.Load("chat");
        var conversation = new List<object>(
            messages.Select(m => (object)new { role = m.Role, content = m.Content })
        );

        try
        {
            for (var round = 0; round < MaxRounds; round++)
            {
                var outcome = await RunRoundAsync(conversation, system, ndjson, cancellationToken);
                conversation.Add(AnthropicConversationPayload.BuildAssistantMessage(outcome.Blocks));

                if (outcome.StopReason != "tool_use" || outcome.ToolUseCalls.Count == 0)
                {
                    await ndjson.WriteAsync(new DoneChatEvent(), cancellationToken);
                    return;
                }

                var toolResultBlocks = await RunToolsAsync(outcome.ToolUseCalls, tools, ndjson, cancellationToken);
                conversation.Add(new { role = "user", content = toolResultBlocks });
            }

            await ndjson.WriteAsync(new DoneChatEvent(), cancellationToken);
        }
        catch (OperationCanceledException)
        {
            throw;
        }
        catch (Exception ex)
        {
            try { await ndjson.WriteAsync(new ErrorChatEvent(ex.Message), cancellationToken); }
            catch { /* fall through; outer caller decides what to do. */ }
            throw;
        }
    }

    private async Task<List<object>> RunToolsAsync(
        IReadOnlyList<AnthropicToolUseCall> toolCalls,
        ResumeTools tools,
        NdjsonWriter ndjson,
        CancellationToken cancellationToken
    )
    {
        var results = new List<object>();
        foreach (var call in toolCalls)
        {
            JsonElement output;
            string? error = null;
            try
            {
                output = await tools.RunAsync(call.Name, call.Input, cancellationToken);
            }
            catch (Exception ex)
            {
                error = ex.Message;
                output = JsonSerializer.SerializeToElement(new { error = ex.Message });
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

    private async Task<AnthropicRoundResult> RunRoundAsync(
        IReadOnlyList<object> conversation,
        string system,
        NdjsonWriter ndjson,
        CancellationToken cancellationToken
    )
    {
        var payload = BuildPayload(conversation, system);
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

    private Dictionary<string, JsonElement> BuildPayload(IReadOnlyList<object> conversation, string system)
    {
        return new Dictionary<string, JsonElement>
        {
            ["model"] = JsonSerializer.SerializeToElement(_options.Model),
            ["max_tokens"] = JsonSerializer.SerializeToElement(_options.MaxTokens),
            ["stream"] = JsonSerializer.SerializeToElement(true),
            ["system"] = JsonSerializer.SerializeToElement(system),
            ["tools"] = JsonSerializer.SerializeToElement(ResumeToolDefinitions.All),
            ["messages"] = JsonSerializer.SerializeToElement(conversation),
        };
    }
}
