namespace Portfolio.Api.Options;

/// <summary>Per-request flags controlling optional NDJSON telemetry on the chat stream.</summary>
public sealed class NdjsonStreamFlags
{
    public static NdjsonStreamFlags Default { get; } = new();

    public bool EmitTraceSpans { get; init; }
    public bool EmitUsageEvents { get; init; }
    public bool UsePromptCaching { get; init; } = true;
    public bool ReflectionPlannerEnabled { get; init; }
}
