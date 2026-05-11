using System.Text;
using System.Text.Json;

namespace Portfolio.Api.Services.Anthropic;

/// <summary>Mutable builder for one assistant content block while SSE deltas arrive.</summary>
internal sealed class AnthropicContentBlockBuilder
{
    public string Type { get; set; } = "text";
    public StringBuilder TextBuilder { get; } = new();
    public StringBuilder PartialJsonBuilder { get; } = new();
    public string ToolUseId { get; set; } = string.Empty;
    public string ToolName { get; set; } = string.Empty;
    public JsonElement ParsedToolInput { get; set; }
}

/// <summary>Completed <c>tool_use</c> from one streamed round.</summary>
internal sealed record AnthropicToolUseCall(string Id, string Name, JsonElement Input);

/// <summary>Outcome of parsing a single streamed assistant turn.</summary>
internal sealed record AnthropicRoundResult(
    string? StopReason,
    IReadOnlyList<AnthropicContentBlockBuilder> Blocks,
    IReadOnlyList<AnthropicToolUseCall> ToolUseCalls
);

/// <summary>Tracks open and finalized content blocks while reading SSE lines.</summary>
internal sealed class AnthropicSseRoundAccumulator
{
    public Dictionary<int, AnthropicContentBlockBuilder> OpenBlocks { get; } = new();
    public List<AnthropicContentBlockBuilder> FinalizedBlocks { get; } = [];
    public string? StopReason { get; set; }

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

        return new AnthropicRoundResult(StopReason, FinalizedBlocks, toolUses);
    }
}

/// <summary>Builds the JSON shape Anthropic expects for a prior assistant turn.</summary>
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
