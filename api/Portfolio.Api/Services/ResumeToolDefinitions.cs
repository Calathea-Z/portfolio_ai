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
    public const string SearchResume = "search_resume";
    public const string ListProjectsBySkill = "list_projects_by_skill";
    public const string GetMetrics = "get_metrics";
    public const string ListRecentShipped = "list_recent_shipped";
    public const string GetNarrative = "get_narrative";
    public const string GetFaq = "get_faq";

    private static readonly Lazy<IReadOnlyList<JsonElement>> AllLazy = new(Build, isThreadSafe: true);

    /// <summary>The full tool roster as Anthropic-compatible JSON definitions.</summary>
    public static IReadOnlyList<JsonElement> All => AllLazy.Value;

    private static IReadOnlyList<JsonElement> Build()
    {
        return new[]
        {
            ToolDefinition(
                GetRole,
                "Return one or more resume roles. Optionally filter by role id, employer/org name (case-insensitive substring), or a calendar year inside the role's tenure. With no filters, returns every role so the model can enumerate.",
                ResumeToolInputSchemas.GetRoleJson
            ),
            ToolDefinition(
                SearchResume,
                "Case-insensitive substring search across roles, projects, narrative fields, FAQ entries, and person summary/lookingFor/logistics fields. Returns kind (role, project, narrative, faq, or person), id, and which fields matched. Use when the visitor's wording does not map cleanly to get_role or list_projects_by_skill.",
                ResumeToolInputSchemas.SearchResumeJson
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
            ToolDefinition(
                GetNarrative,
                "Return Zach's free-form career narrative (originStory, bridge, carryover). Use this for career-change / origin-story questions ('why did you leave kitchens?', 'how did you become an engineer?', 'what carries over from your prior career?') where structured role rows do not capture the answer. No inputs.",
                ResumeToolInputSchemas.GetNarrativeJson
            ),
            ToolDefinition(
                GetFaq,
                "Return pre-written FAQ entries. With no filters, returns every entry. Filter by stable id (e.g. 'next-role', 'why-chatbot', 'mcp-server', 'career-change', 'philosophy') or by case-insensitive keyword against question/answer text. Use this for predictable recruiter questions: what kind of role Zach wants next, why he built this chatbot, what the MCP resume server is, biggest accomplishment, learning approach, engineering philosophy.",
                ResumeToolInputSchemas.GetFaqJson
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
