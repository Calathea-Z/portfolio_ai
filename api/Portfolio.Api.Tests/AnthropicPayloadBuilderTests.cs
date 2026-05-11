using System.Text.Json;
using Portfolio.Api.Options;
using Portfolio.Api.Services.Anthropic;

namespace Portfolio.Api.Tests;

public class AnthropicPayloadBuilderTests
{
    private static readonly AnthropicOptions Options = new()
    {
        ApiKey = "test",
        Model = "claude-test",
        MaxTokens = 1024,
    };

    [Fact]
    public void Build_WithCaching_IncludesEphemeralCacheControlOnSystemAndFirstThreeToolsOnly()
    {
        var conversation = new List<object> { new { role = "user", content = "hi" } };
        var payload = AnthropicPayloadBuilder.Build(Options, conversation, "system text", usePromptCaching: true, reflectionAppendix: null);

        var system = payload["system"];
        Assert.Equal(JsonValueKind.Array, system.ValueKind);
        var first = system[0];
        Assert.Equal("text", first.GetProperty("type").GetString());
        Assert.Equal("system text", first.GetProperty("text").GetString());
        Assert.Equal("ephemeral", first.GetProperty("cache_control").GetProperty("type").GetString());

        var tools = payload["tools"];
        Assert.Equal(JsonValueKind.Array, tools.ValueKind);
        Assert.True(tools.GetArrayLength() >= 4, "Resume has four tools; fourth must omit cache_control per API cap.");

        for (var i = 0; i < tools.GetArrayLength(); i++)
        {
            var tool = tools[i];
            var hasCache = tool.TryGetProperty("cache_control", out var cc);
            if (i < 3)
            {
                Assert.True(hasCache);
                Assert.Equal("ephemeral", cc.GetProperty("type").GetString());
            }
            else
            {
                Assert.False(hasCache, $"Tool index {i} should not use cache_control when system already uses one slot.");
            }
        }

        var toolBlocks = 0;
        foreach (var t in tools.EnumerateArray())
            toolBlocks += CountCacheControlBlocks(t);
        var cacheBlocks = CountCacheControlBlocks(system) + toolBlocks;
        Assert.True(cacheBlocks <= 4, $"Anthropic allows at most 4 cache_control blocks; got {cacheBlocks}.");
    }

    private static int CountCacheControlBlocks(JsonElement el)
    {
        if (el.ValueKind == JsonValueKind.Array)
        {
            var n = 0;
            foreach (var item in el.EnumerateArray())
                n += CountCacheControlBlocks(item);
            return n;
        }

        if (el.ValueKind == JsonValueKind.Object && el.TryGetProperty("cache_control", out _))
            return 1;
        return 0;
    }

    [Fact]
    public void Build_WithReflection_AppendsSecondUncachedSystemBlock()
    {
        var conversation = new List<object>();
        var appendix = "Plan first.";
        var payload = AnthropicPayloadBuilder.Build(Options, conversation, "primary", usePromptCaching: true, appendix);

        var system = payload["system"];
        Assert.Equal(2, system.GetArrayLength());
        Assert.False(system[1].TryGetProperty("cache_control", out _), "Planner block should not be cached.");
        Assert.Equal(appendix, system[1].GetProperty("text").GetString());
    }
}
