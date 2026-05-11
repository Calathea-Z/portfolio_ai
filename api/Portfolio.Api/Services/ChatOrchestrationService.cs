using Microsoft.Extensions.Options;
using Portfolio.Api.Infrastructure;
using Portfolio.Api.Models;
using Portfolio.Api.Options;
using Portfolio.Api.Validation;

namespace Portfolio.Api.Services;

/// <summary>
/// Coordinates validation, token budget, logging, and streaming for <c>POST /chat</c>.
/// </summary>
public sealed class ChatOrchestrationService(
    IAgenticChatRunner agenticChat,
    ResumeTools resumeTools,
    DailyTokenBudgetService budgetService,
    IConfiguration configuration,
    IOptions<AnthropicOptions> anthropicOptions,
    IOptions<ReflectionOptions> reflectionOptions,
    ILogger<ChatOrchestrationService> logger
)
{
    public Task ExecuteAsync(HttpContext http, ChatRequest body, CancellationToken ct) =>
        ExecuteCoreAsync(http, body, chargeBudget: true, ct);

    /// <summary>Eval route: same NDJSON stream, skips daily token budget and rate limit (controller).</summary>
    public Task ExecuteEvalAsync(HttpContext http, ChatRequest body, CancellationToken ct) =>
        ExecuteCoreAsync(http, body, chargeBudget: false, ct);

    private async Task ExecuteCoreAsync(HttpContext http, ChatRequest body, bool chargeBudget, CancellationToken ct)
    {
        var validationError = ChatValidation.Validate(body);
        if (validationError is not null)
        {
            http.Response.StatusCode = StatusCodes.Status400BadRequest;
            await http.Response.WriteAsJsonAsync(new { error = validationError }, cancellationToken: ct);
            return;
        }

        var maxOutput = anthropicOptions.Value.MaxTokens;
        var estimatedInputTokens = EstimateInputTokens(body);
        var estimatedTokens = estimatedInputTokens + maxOutput;
        var budget = configuration.GetValue("ChatProtection:DailyEstimatedTokensPerIp", 120_000);
        var clientKey = ClientIdentity.ForBudget(http);

        if (chargeBudget)
        {
            if (!budgetService.TryCharge(clientKey, estimatedTokens, budget, out var remaining))
            {
                http.Response.StatusCode = StatusCodes.Status429TooManyRequests;
                await http.Response.WriteAsJsonAsync(
                    new { error = "Daily request budget reached. Please try again tomorrow." },
                    cancellationToken: ct
                );
                return;
            }

            logger.LogInformation(
                "Chat request from {ClientKey} with {MessageCount} messages ({EstimatedInputTokens} input est + {MaxOutputTokens} max output = {EstimatedTokens}, {RemainingTokens} remaining).",
                clientKey,
                body.Messages.Count,
                estimatedInputTokens,
                maxOutput,
                estimatedTokens,
                remaining
            );
        }
        else
        {
            logger.LogInformation(
                "Eval chat request with {MessageCount} messages (budget skipped).",
                body.Messages.Count
            );
        }

        http.Response.ContentType = "application/x-ndjson; charset=utf-8";
        http.Response.Headers.CacheControl = "no-store";

        var flags = BuildNdjsonFlags(http);

        try
        {
            await agenticChat.RunAsync(body.Messages, resumeTools, http.Response.Body, flags, ct);
        }
        catch (Exception ex)
        {
            if (http.Response.HasStarted)
            {
                logger.LogWarning(ex, "Chat stream failed after the response body started; client may see partial NDJSON.");
                return;
            }

            http.Response.StatusCode = StatusCodes.Status502BadGateway;
            http.Response.ContentType = "application/json; charset=utf-8";
            await http.Response.WriteAsJsonAsync(new { error = ex.Message }, cancellationToken: ct);
        }
    }

    private NdjsonStreamFlags BuildNdjsonFlags(HttpContext http)
    {
        var debugHeader = http.Request.Headers["X-Chat-Debug"].ToString();
        var traceHeader = http.Request.Headers["X-Chat-Trace"].ToString();
        var traceQuery = http.Request.Query["trace"].ToString();

        var emitUsage =
            configuration.GetValue("ChatStream:EmitUsageEvents", false)
            || string.Equals(debugHeader, "1", StringComparison.OrdinalIgnoreCase);

        var emitTrace =
            configuration.GetValue("ChatStream:EmitTraceSpans", false)
            || string.Equals(traceHeader, "1", StringComparison.OrdinalIgnoreCase)
            || string.Equals(traceQuery, "1", StringComparison.OrdinalIgnoreCase);

        var useCaching = configuration.GetValue("ChatStream:UsePromptCaching", true);

        return new NdjsonStreamFlags
        {
            EmitUsageEvents = emitUsage,
            EmitTraceSpans = emitTrace,
            UsePromptCaching = useCaching,
            ReflectionPlannerEnabled = reflectionOptions.Value.PlannerEnabled,
        };
    }

    private static int EstimateInputTokens(ChatRequest body) =>
        Math.Max(1, body.Messages.Sum(m => m.Content.Length) / 4);
}
