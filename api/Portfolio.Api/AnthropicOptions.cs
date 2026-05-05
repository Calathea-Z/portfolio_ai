using System.ComponentModel.DataAnnotations;

namespace Portfolio.Api;

public sealed class AnthropicOptions
{
    public const string SectionName = "Anthropic";

    /// <summary>Anthropic API key (use user-secrets or environment variable Anthropic__ApiKey).</summary>
    [Required]
    public string ApiKey { get; set; } = string.Empty;

    /// <summary>Model id for Messages API, e.g. claude-sonnet-4-20250514.</summary>
    [Required]
    public string Model { get; set; } = "claude-sonnet-4-20250514";

    [Range(1, 8192)]
    public int MaxTokens { get; set; } = 4096;
}
