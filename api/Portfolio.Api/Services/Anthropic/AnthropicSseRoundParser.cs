using System.Text;
using System.Text.Json;
using Portfolio.Api.Models;

namespace Portfolio.Api.Services.Anthropic;

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
            case "message_start":
                HandleMessageStart(root, state);
                break;

            case "error":
                var message = root.TryGetProperty("error", out var errorObj)
                    && errorObj.TryGetProperty("message", out var msgEl)
                        ? msgEl.GetString()
                        : null;
                throw new InvalidOperationException(message ?? dataJson);

            case "content_block_start":
                await HandleContentBlockStartAsync(root, state, ndjson, cancellationToken);
                break;

            case "content_block_delta":
                await HandleContentBlockDeltaAsync(root, state, ndjson, cancellationToken);
                break;

            case "content_block_stop":
                await HandleContentBlockStopAsync(root, state, ndjson, cancellationToken);
                break;

            case "message_delta":
                await HandleMessageDeltaAsync(root, state, cancellationToken);
                break;
        }
    }

    private static void HandleMessageStart(JsonElement root, AnthropicSseRoundAccumulator state)
    {
        if (!root.TryGetProperty("message", out var msg)) return;
        if (!msg.TryGetProperty("usage", out var usage)) return;
        state.TokenUsage.MergeFromUsageObject(usage);
    }

    private static async Task HandleMessageDeltaAsync(
        JsonElement root,
        AnthropicSseRoundAccumulator state,
        CancellationToken cancellationToken
    )
    {
        _ = cancellationToken;
        if (!root.TryGetProperty("delta", out var delta)) return;

        if (delta.TryGetProperty("stop_reason", out var stopReason) && stopReason.ValueKind == JsonValueKind.String)
            state.StopReason = stopReason.GetString();

        if (delta.TryGetProperty("usage", out var usage))
            state.TokenUsage.MergeFromUsageObject(usage);
    }

    private static async Task HandleContentBlockStartAsync(
        JsonElement root,
        AnthropicSseRoundAccumulator state,
        NdjsonWriter ndjson,
        CancellationToken cancellationToken
    )
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
            var toolId = id ?? string.Empty;
            var toolName = name ?? string.Empty;
            state.OpenBlocks[index] = new AnthropicContentBlockBuilder
            {
                Type = "tool_use",
                ToolUseId = toolId,
                ToolName = toolName,
            };

            if (!string.IsNullOrEmpty(toolId) && !string.IsNullOrEmpty(toolName))
            {
                await ndjson.WriteAsync(new ToolCallStartChatEvent(toolId, toolName), cancellationToken);
            }
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
                    var frag = pj.GetString();
                    if (!string.IsNullOrEmpty(frag))
                    {
                        block.PartialJsonBuilder.Append(frag);
                        if (!string.IsNullOrEmpty(block.ToolUseId))
                            await ndjson.WriteAsync(new ToolInputDeltaChatEvent(block.ToolUseId, frag), cancellationToken);
                    }
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
            JsonElement input;
            try
            {
                var raw = block.PartialJsonBuilder.ToString();
                input = string.IsNullOrWhiteSpace(raw)
                    ? JsonSerializer.SerializeToElement(new { })
                    : JsonDocument.Parse(raw).RootElement.Clone();
            }
            catch (JsonException)
            {
                input = JsonSerializer.SerializeToElement(new { error = "invalid_tool_input_json" });
            }

            block.ParsedToolInput = input;
            await ndjson.WriteAsync(
                new ToolCallChatEvent(block.ToolUseId, block.ToolName, input),
                cancellationToken
            );
        }

        state.FinalizeBlock(index);
    }
}
