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
          }
        }
        """;

    public const string ListProjectsBySkillJson =
        """
        {
          "type": "object",
          "additionalProperties": false,
          "properties": {
            "skill": { "type": "string", "description": "Technology or skill name to match against project.tech (e.g. 'WebSocket', 'Next.js', '.NET')." }
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
}
