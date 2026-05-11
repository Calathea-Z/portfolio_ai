using System.Text;
using System.Text.Json;
using Portfolio.Api.Models;

namespace Portfolio.Api.Services.Anthropic;

/// <summary>
/// Reads one SSE round from the Anthropic Messages streaming API and forwards
/// <see cref="ChatEvent"/> instances to the NDJSON writer.
/// </summary>
internal static class AnthropicSseRoundParser
{
    public static async Task<AnthropicRoundResult> ParseAsync(
        Stream upstream,
        NdjsonWriter ndjson,
        CancellationToken cancellationToken
    )
    {
        using var reader = new StreamReader(upstream, Encoding.UTF8, detectEncodingFromByteOrderMarks: false);
        var state = new AnthropicSseRoundAccumulator();
        var dataBuffer = new List<string>();

        async Task FlushDataAsync()
        {
            if (dataBuffer.Count == 0) return;
            var dataJson = string.Join("\n", dataBuffer);
            dataBuffer.Clear();
            await ProcessSseEventAsync(dataJson, state, ndjson, cancellationToken);
        }

        while (await reader.ReadLineAsync(cancellationToken) is { } line)
        {
            if (line.StartsWith("data:", StringComparison.Ordinal))
            {
                dataBuffer.Add(line[5..].Trim());
                continue;
            }

            if (line.Length == 0) await FlushDataAsync();
        }

        await FlushDataAsync();

        return state.ToResult();
    }

    private static async Task ProcessSseEventAsync(
        string dataJson,
        AnthropicSseRoundAccumulator state,
        NdjsonWriter ndjson,
        CancellationToken cancellationToken
    )
    {
        if (string.IsNullOrWhiteSpace(dataJson)) return;

        using var doc = JsonDocument.Parse(dataJson);
        var root = doc.RootElement;
        if (!root.TryGetProperty("type", out var typeEl)) return;

        switch (typeEl.GetString())
        {
            case "error":
                var message = root.TryGetProperty("error", out var errorObj)
                    && errorObj.TryGetProperty("message", out var msgEl)
                        ? msgEl.GetString()
                        : null;
                throw new InvalidOperationException(message ?? dataJson);

            case "content_block_start":
                HandleContentBlockStart(root, state);
                break;

            case "content_block_delta":
                await HandleContentBlockDeltaAsync(root, state, ndjson, cancellationToken);
                break;

            case "content_block_stop":
                await HandleContentBlockStopAsync(root, state, ndjson, cancellationToken);
                break;

            case "message_delta":
                if (root.TryGetProperty("delta", out var delta)
                    && delta.TryGetProperty("stop_reason", out var stopReason)
                    && stopReason.ValueKind == JsonValueKind.String)
                {
                    state.StopReason = stopReason.GetString();
                }
                break;
        }
    }

    private static void HandleContentBlockStart(JsonElement root, AnthropicSseRoundAccumulator state)
    {
        if (!root.TryGetProperty("index", out var idxEl)) return;
        if (!root.TryGetProperty("content_block", out var blockEl)) return;
        if (!blockEl.TryGetProperty("type", out var bt)) return;

        var index = idxEl.GetInt32();
        var blockType = bt.GetString();

        if (blockType == "text")
        {
            state.OpenBlocks[index] = new AnthropicContentBlockBuilder { Type = "text" };
        }
        else if (blockType == "tool_use")
        {
            var id = blockEl.TryGetProperty("id", out var idEl) ? idEl.GetString() : null;
            var name = blockEl.TryGetProperty("name", out var nameEl) ? nameEl.GetString() : null;
            state.OpenBlocks[index] = new AnthropicContentBlockBuilder
            {
                Type = "tool_use",
                ToolUseId = id ?? string.Empty,
                ToolName = name ?? string.Empty,
            };
        }
    }

    private static async Task HandleContentBlockDeltaAsync(
        JsonElement root,
        AnthropicSseRoundAccumulator state,
        NdjsonWriter ndjson,
        CancellationToken cancellationToken
    )
    {
        if (!root.TryGetProperty("index", out var idxEl)) return;
        if (!root.TryGetProperty("delta", out var delta)) return;
        if (!delta.TryGetProperty("type", out var dt)) return;

        var index = idxEl.GetInt32();
        if (!state.OpenBlocks.TryGetValue(index, out var block)) return;

        switch (dt.GetString())
        {
            case "text_delta":
                if (delta.TryGetProperty("text", out var textEl) && textEl.ValueKind == JsonValueKind.String)
                {
                    var text = textEl.GetString();
                    if (!string.IsNullOrEmpty(text))
                    {
                        block.TextBuilder.Append(text);
                        await ndjson.WriteAsync(new TextChatEvent(text), cancellationToken);
                    }
                }
                break;

            case "input_json_delta":
                if (delta.TryGetProperty("partial_json", out var pj) && pj.ValueKind == JsonValueKind.String)
                {
                    block.PartialJsonBuilder.Append(pj.GetString());
                }
                break;
        }
    }

    private static async Task HandleContentBlockStopAsync(
        JsonElement root,
        AnthropicSseRoundAccumulator state,
        NdjsonWriter ndjson,
        CancellationToken cancellationToken
    )
    {
        if (!root.TryGetProperty("index", out var idxEl)) return;
        var index = idxEl.GetInt32();
        if (!state.OpenBlocks.TryGetValue(index, out var block)) return;

        if (block.Type == "tool_use")
        {
            var raw = block.PartialJsonBuilder.ToString();
            var input = string.IsNullOrWhiteSpace(raw)
                ? JsonSerializer.SerializeToElement(new { })
                : JsonDocument.Parse(raw).RootElement.Clone();

            block.ParsedToolInput = input;
            await ndjson.WriteAsync(
                new ToolCallChatEvent(block.ToolUseId, block.ToolName, input),
                cancellationToken
            );
        }

        state.FinalizeBlock(index);
    }
}
