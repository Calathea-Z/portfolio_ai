namespace Portfolio.Api.Options;

public sealed class ReflectionOptions
{
    public const string SectionName = "Reflection";

    /// <summary>When true, appends an uncached planner instruction to the system prompt array.</summary>
    public bool PlannerEnabled { get; set; }
}
