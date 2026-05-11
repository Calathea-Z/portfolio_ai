using System.Text.Json;
using Portfolio.Api.Options;

namespace Portfolio.Api.Services.Anthropic;

/// <summary>Builds Anthropic Messages API JSON payloads (system array, tools, messages).</summary>
/// <remarks>
/// Anthropic allows at most <b>four</b> content/tool definitions with <c>cache_control</c> in one request.
/// We reserve one slot for the primary system block; up to three tool definitions may be marked
/// cacheable so we stay within the limit (e.g. 1 system + 4 tools would be invalid).
/// </remarks>
internal static class AnthropicPayloadBuilder
{
    /// <summary>Max <c>cache_control</c> breakpoints per Messages API request (system + tools combined).</summary>
    private const int MaxCacheControlBlocks = 4;

    public static Dictionary<string, JsonElement> Build(
        AnthropicOptions options,
        IReadOnlyList<object> conversation,
        string systemPrompt,
        bool usePromptCaching,
        string? reflectionAppendix
    )
    {
        // One slot is used by the cached primary system block when usePromptCaching is true.
        var toolCacheSlots = usePromptCaching ? Math.Max(0, MaxCacheControlBlocks - 1) : 0;
        var tools = usePromptCaching
            ? ToolsWithLimitedCacheControl(ResumeToolDefinitions.All, toolCacheSlots)
            : JsonSerializer.SerializeToElement(ResumeToolDefinitions.All);

        var system = usePromptCaching
            ? BuildCachedSystemArray(systemPrompt, reflectionAppendix)
            : BuildLegacySystem(systemPrompt, reflectionAppendix);

        return new Dictionary<string, JsonElement>
        {
            ["model"] = JsonSerializer.SerializeToElement(options.Model),
            ["max_tokens"] = JsonSerializer.SerializeToElement(options.MaxTokens),
            ["stream"] = JsonSerializer.SerializeToElement(true),
            ["system"] = system,
            ["tools"] = tools,
            ["messages"] = JsonSerializer.SerializeToElement(conversation),
        };
    }

    private static JsonElement BuildLegacySystem(string primary, string? appendix)
    {
        if (string.IsNullOrWhiteSpace(appendix))
            return JsonSerializer.SerializeToElement(primary);

        var combined = primary + "\n\n" + appendix;
        return JsonSerializer.SerializeToElement(combined);
    }

    /// <summary>System as content blocks: primary text optionally cacheable; optional appendix never cached.</summary>
    private static JsonElement BuildCachedSystemArray(string primary, string? appendix)
    {
        using var ms = new MemoryStream();
        using (var w = new Utf8JsonWriter(ms))
        {
            w.WriteStartArray();

            w.WriteStartObject();
            w.WriteString("type", "text");
            w.WriteString("text", primary);
            w.WritePropertyName("cache_control");
            w.WriteStartObject();
            w.WriteString("type", "ephemeral");
            w.WriteEndObject();
            w.WriteEndObject();

            if (!string.IsNullOrWhiteSpace(appendix))
            {
                w.WriteStartObject();
                w.WriteString("type", "text");
                w.WriteString("text", appendix);
                w.WriteEndObject();
            }

            w.WriteEndArray();
        }

        return JsonDocument.Parse(ms.ToArray()).RootElement.Clone();
    }

    /// <summary>
    /// Adds <c>cache_control</c> to the first <paramref name="maxCachedTools"/> tools only
    /// so total breakpoints (1 system + N tools) never exceeds <see cref="MaxCacheControlBlocks"/>.
    /// </summary>
    private static JsonElement ToolsWithLimitedCacheControl(IReadOnlyList<JsonElement> tools, int maxCachedTools)
    {
        using var ms = new MemoryStream();
        using (var w = new Utf8JsonWriter(ms))
        {
            w.WriteStartArray();
            var index = 0;
            foreach (var tool in tools)
            {
                w.WriteStartObject();
                foreach (var prop in tool.EnumerateObject())
                {
                    w.WritePropertyName(prop.Name);
                    prop.Value.WriteTo(w);
                }

                if (index < maxCachedTools)
                {
                    w.WritePropertyName("cache_control");
                    w.WriteStartObject();
                    w.WriteString("type", "ephemeral");
                    w.WriteEndObject();
                }

                w.WriteEndObject();
                index++;
            }

            w.WriteEndArray();
        }

        return JsonDocument.Parse(ms.ToArray()).RootElement.Clone();
    }
}
