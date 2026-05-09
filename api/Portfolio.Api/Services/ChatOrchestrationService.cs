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
    AnthropicStreamService anthropic,
    DailyTokenBudgetService budgetService,
    IConfiguration configuration,
    IOptions<AnthropicOptions> anthropicOptions,
    ILogger<ChatOrchestrationService> logger
)
{
    public async Task ExecuteAsync(HttpContext http, ChatRequest body, CancellationToken ct)
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

        http.Response.ContentType = "text/plain; charset=utf-8";
        http.Response.Headers.CacheControl = "no-store";

        try
        {
            await anthropic.StreamChatAsync(body.Messages, http.Response.Body, ct);
        }
        catch (Exception ex)
        {
            if (http.Response.HasStarted) throw;

            http.Response.StatusCode = StatusCodes.Status502BadGateway;
            http.Response.ContentType = "application/json; charset=utf-8";
            await http.Response.WriteAsJsonAsync(new { error = ex.Message }, cancellationToken: ct);
        }
    }

    private static int EstimateInputTokens(ChatRequest body) =>
        Math.Max(1, body.Messages.Sum(m => m.Content.Length) / 4);
}
