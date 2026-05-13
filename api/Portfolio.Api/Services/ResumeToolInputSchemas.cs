namespace Portfolio.Api.Services;

/// <summary>
/// Single source of truth for Anthropic <c>input_schema</c> JSON strings. Changing a
/// schema here without updating the matching POCO in <see cref="Models.ResumeToolInputs"/>
/// should fail tests or review.
/// </summary>
public static class ResumeToolInputSchemas
{
    public const string GetRoleJson =
        """
        {
          "type": "object",
          "additionalProperties": false,
          "properties": {
            "id":   { "type": "string",  "description": "Stable role id, e.g. 'forvis-mazars'." },
            "year": { "type": "integer", "description": "Calendar year (e.g. 2025). Returns roles active during that year." },
            "org":  { "type": "string",  "description": "Employer or organization name; case-insensitive substring match." }
          },
          "description": "All properties optional. Omit every property (or pass {}) to return every role; combine filters to narrow."
        }
        """;

    public const string ListProjectsBySkillJson =
        """
        {
          "type": "object",
          "additionalProperties": false,
          "properties": {
            "skill": { "type": "string", "description": "Technology or skill name to match against each entry in project.tech: case-insensitive exact match, or substring match when the skill is at least two characters (e.g. '.NET' matches stack labels that include it, such as 'ASP.NET Core')." }
          },
          "required": ["skill"]
        }
        """;

    public const string GetMetricsJson =
        """
        {
          "type": "object",
          "additionalProperties": false,
          "properties": {
            "id": { "type": "string", "description": "Optional metric id, e.g. 'yoe-professional'." }
          }
        }
        """;

    public const string ListRecentShippedJson =
        """
        {
          "type": "object",
          "additionalProperties": false,
          "properties": {
            "limit": { "type": "integer", "description": "Max projects to return; defaults to 5.", "minimum": 1, "maximum": 20 }
          }
        }
        """;

    public const string SearchResumeJson =
        """
        {
          "type": "object",
          "additionalProperties": false,
          "properties": {
            "query": { "type": "string", "description": "Case-insensitive substring to match across role text (title, org, summary, achievements, tech), project text (name, summary, outcomes, tech), narrative fields, FAQ entries, and person summary/lookingFor." }
          },
          "required": ["query"]
        }
        """;

    public const string GetNarrativeJson =
        """
        {
          "type": "object",
          "additionalProperties": false,
          "properties": {},
          "description": "No inputs. Returns Zach's free-form career narrative: originStory, bridge, carryover."
        }
        """;

    public const string GetFaqJson =
        """
        {
          "type": "object",
          "additionalProperties": false,
          "properties": {
            "id":      { "type": "string", "description": "Stable FAQ entry id, e.g. 'career-change'." },
            "keyword": { "type": "string", "description": "Case-insensitive substring matched against the question and answer text." }
          },
          "description": "All properties optional. Omit both (or pass {}) to return every FAQ entry."
        }
        """;
}
