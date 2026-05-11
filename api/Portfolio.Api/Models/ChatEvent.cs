using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Portfolio.Api.Models;

/// <summary>
/// Discriminated union of events the chat backend streams to the browser as
/// newline-delimited JSON (NDJSON, <c>application/x-ndjson</c>).
/// </summary>
[JsonPolymorphic(TypeDiscriminatorPropertyName = "kind")]
[JsonDerivedType(typeof(TextChatEvent),       "text")]
[JsonDerivedType(typeof(ToolCallChatEvent),   "tool_call")]
[JsonDerivedType(typeof(ToolResultChatEvent), "tool_result")]
[JsonDerivedType(typeof(DoneChatEvent),       "done")]
[JsonDerivedType(typeof(ErrorChatEvent),      "error")]
public abstract record ChatEvent;

/// <summary>An incremental text delta from the assistant.</summary>
public sealed record TextChatEvent([property: JsonPropertyName("text")] string Text) : ChatEvent;

/// <summary>A completed tool_use block: the model has finished assembling input JSON and is asking the server to invoke <paramref name="Name"/>.</summary>
public sealed record ToolCallChatEvent(
    [property: JsonPropertyName("id")] string Id,
    [property: JsonPropertyName("name")] string Name,
    [property: JsonPropertyName("input")] JsonElement Input
) : ChatEvent;

/// <summary>Result of running a tool, keyed by the originating tool_use id.</summary>
public sealed record ToolResultChatEvent(
    [property: JsonPropertyName("id")] string Id,
    [property: JsonPropertyName("output")] JsonElement Output,
    [property: JsonPropertyName("error")] string? Error
) : ChatEvent;

/// <summary>End-of-stream marker.</summary>
public sealed record DoneChatEvent : ChatEvent;

/// <summary>A non-recoverable error happened mid-stream.</summary>
public sealed record ErrorChatEvent([property: JsonPropertyName("message")] string Message) : ChatEvent;

/// <summary>
/// Serializes <see cref="ChatEvent"/> instances as NDJSON lines into a
/// destination stream. Each call writes <c>{...}\n</c> and flushes so the
/// browser can show incremental progress.
/// </summary>
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
