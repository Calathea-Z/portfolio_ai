namespace Portfolio.Api.Options;

public sealed class EvalOptions
{
    public const string SectionName = "Eval";

    /// <summary>Shared secret for <c>X-Eval-Key</c> on <c>/internal/chat-evals</c>.</summary>
    public string? ApiKey { get; set; }
}
