using Portfolio.Api.Services;

namespace Portfolio.Api.Tests;

public class SystemPromptLoaderTests
{
    [Fact]
    public void Load_ReturnsChatPrompt_WhenNameMatchesEmbeddedResource()
    {
        var prompt = SystemPromptLoader.Load("chat");

        Assert.False(string.IsNullOrWhiteSpace(prompt));
        Assert.Contains("Zach Sykes", prompt);
    }

    [Fact]
    public void Load_IsCached_ReturnsSameInstanceForSameName()
    {
        var first = SystemPromptLoader.Load("chat");
        var second = SystemPromptLoader.Load("chat");

        Assert.Same(first, second);
    }

    [Fact]
    public void Load_Throws_WhenPromptResourceMissing()
    {
        var ex = Assert.Throws<InvalidOperationException>(() => SystemPromptLoader.Load("does-not-exist"));
        Assert.Contains("does-not-exist.md", ex.Message);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Load_Throws_WhenNameIsNullOrWhitespace(string? name)
    {
        Assert.Throws<ArgumentException>(() => SystemPromptLoader.Load(name!));
    }
}
