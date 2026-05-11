using System.Text.Json;

namespace Portfolio.Api.Services;

/// <summary>
/// Anthropic Messages API tool definitions exposed by the chat agent.
/// </summary>
/// <remarks>
/// <c>input_schema</c> JSON is sourced from <see cref="ResumeToolInputSchemas"/> so it stays in
/// sync with <see cref="ResumeToolInputValidator"/> and the typed inputs in
/// <see cref="Models.ResumeToolInputs"/>.
/// </remarks>
public static class ResumeToolDefinitions
{
    public const string GetRole = "get_role";
    public const string ListProjectsBySkill = "list_projects_by_skill";
    public const string GetMetrics = "get_metrics";
    public const string ListRecentShipped = "list_recent_shipped";

    private static readonly Lazy<IReadOnlyList<JsonElement>> AllLazy = new(Build, isThreadSafe: true);

    /// <summary>The full tool roster as Anthropic-compatible JSON definitions.</summary>
    public static IReadOnlyList<JsonElement> All => AllLazy.Value;

    private static IReadOnlyList<JsonElement> Build()
    {
        return new[]
        {
            ToolDefinition(
                GetRole,
                "Return one or more matching resume roles. Filter by role id, employer/org name (case-insensitive substring), or a calendar year that falls inside the role's tenure. Pass at least one filter.",
                ResumeToolInputSchemas.GetRoleJson
            ),
            ToolDefinition(
                ListProjectsBySkill,
                "Return projects whose technology stack includes the named skill (case-insensitive). Use this when the visitor asks about which projects used a given technology or framework.",
                ResumeToolInputSchemas.ListProjectsBySkillJson
            ),
            ToolDefinition(
                GetMetrics,
                "Return concrete quantitative metrics from the resume (years of experience, team sizes, etc.). Without 'id' returns all metrics; with 'id' returns just that one.",
                ResumeToolInputSchemas.GetMetricsJson
            ),
            ToolDefinition(
                ListRecentShipped,
                "List recently shipped projects, newest first. Useful for 'what did you ship recently?' or year-scoped recap questions.",
                ResumeToolInputSchemas.ListRecentShippedJson
            ),
        };
    }

    private static JsonElement ToolDefinition(string name, string description, string inputSchemaJson)
    {
        using var schemaDoc = JsonDocument.Parse(inputSchemaJson);
        var payload = new Dictionary<string, JsonElement>
        {
            ["name"] = JsonSerializer.SerializeToElement(name),
            ["description"] = JsonSerializer.SerializeToElement(description),
            ["input_schema"] = schemaDoc.RootElement.Clone(),
        };
        return JsonSerializer.SerializeToElement(payload);
    }
}
