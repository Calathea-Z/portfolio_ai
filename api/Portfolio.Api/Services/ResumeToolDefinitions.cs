using System.Text.Json;

namespace Portfolio.Api.Services;

/// <summary>
/// Anthropic Messages API tool definitions exposed by the chat agent.
/// </summary>
/// <remarks>
/// These schemas are passed verbatim in the <c>tools</c> array of each request
/// (see <see cref="AnthropicStreamService"/>). The names here must match the
/// dispatch table in <see cref="ResumeTools"/>.
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
                """
                {
                  "type": "object",
                  "properties": {
                    "id":   { "type": "string",  "description": "Stable role id, e.g. 'forvis-mazars'." },
                    "year": { "type": "integer", "description": "Calendar year (e.g. 2025). Returns roles active during that year." },
                    "org":  { "type": "string",  "description": "Employer or organization name; case-insensitive substring match." }
                  }
                }
                """),

            ToolDefinition(
                ListProjectsBySkill,
                "Return projects whose technology stack includes the named skill (case-insensitive). Use this when the visitor asks about which projects used a given technology or framework.",
                """
                {
                  "type": "object",
                  "properties": {
                    "skill": { "type": "string", "description": "Technology or skill name to match against project.tech (e.g. 'WebSocket', 'Next.js', '.NET')." }
                  },
                  "required": ["skill"]
                }
                """),

            ToolDefinition(
                GetMetrics,
                "Return concrete quantitative metrics from the resume (years of experience, team sizes, etc.). Without 'id' returns all metrics; with 'id' returns just that one.",
                """
                {
                  "type": "object",
                  "properties": {
                    "id": { "type": "string", "description": "Optional metric id, e.g. 'yoe-professional'." }
                  }
                }
                """),

            ToolDefinition(
                ListRecentShipped,
                "List recently shipped projects, newest first. Useful for 'what did you ship recently?' or year-scoped recap questions.",
                """
                {
                  "type": "object",
                  "properties": {
                    "limit": { "type": "integer", "description": "Max projects to return; defaults to 5.", "minimum": 1, "maximum": 20 }
                  }
                }
                """),
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
