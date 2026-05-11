using System.Text;
using System.Text.Json;

namespace Portfolio.Api.Services.Anthropic;

internal sealed class AnthropicContentBlockBuilder
{
    public string Type { get; set; } = "text";
    public StringBuilder TextBuilder { get; } = new();
    public StringBuilder PartialJsonBuilder { get; } = new();
    public string ToolUseId { get; set; } = string.Empty;
    public string ToolName { get; set; } = string.Empty;
    public JsonElement ParsedToolInput { get; set; }
}

internal sealed record AnthropicToolUseCall(string Id, string Name, JsonElement Input);

/// <summary>Best-effort token counts from streamed <c>message_delta</c> usage patches.</summary>
internal sealed class RoundTokenUsage
{
    public int? InputTokens { get; set; }
    public int? OutputTokens { get; set; }
    public int? CacheCreationInputTokens { get; set; }
    public int? CacheReadInputTokens { get; set; }

    public bool HasAny =>
        InputTokens is not null
        || OutputTokens is not null
        || CacheCreationInputTokens is not null
        || CacheReadInputTokens is not null;

    public void MergeFromUsageObject(JsonElement usage)
    {
        if (usage.ValueKind != JsonValueKind.Object) return;

        if (usage.TryGetProperty("input_tokens", out var it) && it.TryGetInt32(out var iv))
            InputTokens = iv;
        if (usage.TryGetProperty("output_tokens", out var ot) && ot.TryGetInt32(out var ov))
            OutputTokens = ov;
        if (usage.TryGetProperty("cache_creation_input_tokens", out var cc) && cc.TryGetInt32(out var ccv))
            CacheCreationInputTokens = ccv;
        if (usage.TryGetProperty("cache_read_input_tokens", out var cr) && cr.TryGetInt32(out var crv))
            CacheReadInputTokens = crv;
    }
}

internal sealed record AnthropicRoundResult(
    string? StopReason,
    IReadOnlyList<AnthropicContentBlockBuilder> Blocks,
    IReadOnlyList<AnthropicToolUseCall> ToolUseCalls,
    RoundTokenUsage? TokenUsage
);

internal sealed class AnthropicSseRoundAccumulator
{
    public Dictionary<int, AnthropicContentBlockBuilder> OpenBlocks { get; } = new();
    public List<AnthropicContentBlockBuilder> FinalizedBlocks { get; } = [];
    public string? StopReason { get; set; }
    public RoundTokenUsage TokenUsage { get; } = new();

    public void FinalizeBlock(int index)
    {
        if (!OpenBlocks.TryGetValue(index, out var block)) return;
        FinalizedBlocks.Add(block);
        OpenBlocks.Remove(index);
    }

    public AnthropicRoundResult ToResult()
    {
        foreach (var (_, block) in OpenBlocks)
            FinalizedBlocks.Add(block);
        OpenBlocks.Clear();

        var toolUses = FinalizedBlocks
            .Where(b => b.Type == "tool_use")
            .Select(b => new AnthropicToolUseCall(b.ToolUseId, b.ToolName, b.ParsedToolInput))
            .ToList();

        var usage = TokenUsage.HasAny ? TokenUsage : null;
        return new AnthropicRoundResult(StopReason, FinalizedBlocks, toolUses, usage);
    }
}

internal static class AnthropicConversationPayload
{
    public static object BuildAssistantMessage(IReadOnlyList<AnthropicContentBlockBuilder> blocks)
    {
        var content = blocks
            .Select(b => b.Type == "text"
                ? (object)new { type = "text", text = b.TextBuilder.ToString() }
                : new { type = "tool_use", id = b.ToolUseId, name = b.ToolName, input = b.ParsedToolInput })
            .ToList();

        return new { role = "assistant", content };
    }
}
