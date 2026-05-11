using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Portfolio.Api.Models;

/// <summary>
/// Discriminated union of events the chat backend streams as NDJSON (<c>application/x-ndjson</c>).
/// Additive <c>kind</c> values are forward-compatible if clients ignore unknown kinds.
/// </summary>
[JsonPolymorphic(TypeDiscriminatorPropertyName = "kind")]
[JsonDerivedType(typeof(TextChatEvent), "text")]
[JsonDerivedType(typeof(ToolCallStartChatEvent), "tool_call_start")]
[JsonDerivedType(typeof(ToolInputDeltaChatEvent), "tool_input_delta")]
[JsonDerivedType(typeof(ToolCallChatEvent), "tool_call")]
[JsonDerivedType(typeof(ToolResultChatEvent), "tool_result")]
[JsonDerivedType(typeof(UsageRoundChatEvent), "usage")]
[JsonDerivedType(typeof(UsageTotalChatEvent), "usage_total")]
[JsonDerivedType(typeof(TraceSpanChatEvent), "trace_span")]
[JsonDerivedType(typeof(DoneChatEvent), "done")]
[JsonDerivedType(typeof(ErrorChatEvent), "error")]
public abstract record ChatEvent;

public sealed record TextChatEvent([property: JsonPropertyName("text")] string Text) : ChatEvent;

/// <summary>First frame for a <c>tool_use</c> block; client can show a live pill before JSON completes.</summary>
public sealed record ToolCallStartChatEvent(
    [property: JsonPropertyName("id")] string Id,
    [property: JsonPropertyName("name")] string Name
) : ChatEvent;

/// <summary>Incremental partial JSON for the current tool_use block.</summary>
public sealed record ToolInputDeltaChatEvent(
    [property: JsonPropertyName("id")] string Id,
    [property: JsonPropertyName("fragment")] string Fragment
) : ChatEvent;

public sealed record ToolCallChatEvent(
    [property: JsonPropertyName("id")] string Id,
    [property: JsonPropertyName("name")] string Name,
    [property: JsonPropertyName("input")] JsonElement Input
) : ChatEvent;

public sealed record ToolResultChatEvent(
    [property: JsonPropertyName("id")] string Id,
    [property: JsonPropertyName("output")] JsonElement Output,
    [property: JsonPropertyName("error")] string? Error
) : ChatEvent;

/// <summary>Token usage for one assistant round (best-effort from streaming <c>message_delta</c>).</summary>
public sealed record UsageRoundChatEvent(
    [property: JsonPropertyName("round")] int Round,
    [property: JsonPropertyName("inputTokens")] int? InputTokens,
    [property: JsonPropertyName("outputTokens")] int? OutputTokens,
    [property: JsonPropertyName("cacheCreationInputTokens")] int? CacheCreationInputTokens,
    [property: JsonPropertyName("cacheReadInputTokens")] int? CacheReadInputTokens,
    [property: JsonPropertyName("estimatedCostUsd")] decimal? EstimatedCostUsd
) : ChatEvent;

/// <summary>Aggregated usage across all rounds in this HTTP request.</summary>
public sealed record UsageTotalChatEvent(
    [property: JsonPropertyName("inputTokens")] int InputTokens,
    [property: JsonPropertyName("outputTokens")] int OutputTokens,
    [property: JsonPropertyName("estimatedCostUsd")] decimal? EstimatedCostUsd
) : ChatEvent;

/// <summary>Lightweight span for debug / trace UI (capped attributes server-side).</summary>
public sealed record TraceSpanChatEvent(
    [property: JsonPropertyName("name")] string Name,
    [property: JsonPropertyName("round")] int Round,
    [property: JsonPropertyName("durationMs")] double DurationMs,
    [property: JsonPropertyName("attributes")] JsonElement? Attributes
) : ChatEvent;

public sealed record DoneChatEvent : ChatEvent;

public sealed record ErrorChatEvent([property: JsonPropertyName("message")] string Message) : ChatEvent;

public sealed class NdjsonWriter(Stream destination)
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };

    private static readonly byte[] Newline = "\n"u8.ToArray();

    public async Task WriteAsync(ChatEvent evt, CancellationToken cancellationToken)
    {
        var bytes = JsonSerializer.SerializeToUtf8Bytes<ChatEvent>(evt, JsonOptions);
        await destination.WriteAsync(bytes, cancellationToken);
        await destination.WriteAsync(Newline, cancellationToken);
        await destination.FlushAsync(cancellationToken);
    }
}
