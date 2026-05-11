using System.ComponentModel.DataAnnotations;

namespace Portfolio.Api.Options;

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

    /// <summary>Optional rough USD per 1M input tokens for debug usage estimates only.</summary>
    public decimal? EstimatedInputUsdPerMillionTokens { get; set; }

    /// <summary>Optional rough USD per 1M output tokens for debug usage estimates only.</summary>
    public decimal? EstimatedOutputUsdPerMillionTokens { get; set; }
}
