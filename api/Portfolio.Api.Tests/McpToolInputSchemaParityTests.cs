using System.Text.Json.Nodes;
using Portfolio.Api.Services;

namespace Portfolio.Api.Tests;

/// <summary>
/// Ensures <c>mcp/schemas/*.json</c> stays aligned with <see cref="ResumeToolInputSchemas"/> (Anthropic input_schema).
/// </summary>
public sealed class McpToolInputSchemaParityTests
{
    private static string RepoRoot()
    {
        var dir = new DirectoryInfo(AppContext.BaseDirectory);
        while (dir is not null)
        {
            var marker = Path.Combine(dir.FullName, "mcp", "schemas", "get_role.json");
            if (File.Exists(marker))
                return dir.FullName;
            dir = dir.Parent;
        }

        throw new InvalidOperationException(
            "Could not locate repo root (expected mcp/schemas/get_role.json). Run tests from the solution directory.");
    }

    private static void AssertSchemaFileMatches(string relativePathUnderMcpSchemas, string csharpSchemaJson)
    {
        var path = Path.Combine(RepoRoot(), "mcp", "schemas", relativePathUnderMcpSchemas);
        Assert.True(File.Exists(path), $"Missing schema file: {path}");

        var fromFile = JsonNode.Parse(File.ReadAllText(path))
            ?? throw new InvalidOperationException($"Empty or invalid JSON: {path}");
        var fromConst = JsonNode.Parse(csharpSchemaJson)
            ?? throw new InvalidOperationException("ResumeToolInputSchemas constant parsed to null.");

        Assert.True(
            JsonNode.DeepEquals(fromFile, fromConst),
            $"Schema drift: {relativePathUnderMcpSchemas} does not match ResumeToolInputSchemas. File:\n{fromFile}\n\nExpected:\n{fromConst}");
    }

    [Fact]
    public void Get_role_schema_matches_mcp_file() =>
        AssertSchemaFileMatches("get_role.json", ResumeToolInputSchemas.GetRoleJson);

    [Fact]
    public void Search_resume_schema_matches_mcp_file() =>
        AssertSchemaFileMatches("search_resume.json", ResumeToolInputSchemas.SearchResumeJson);

    [Fact]
    public void List_projects_by_skill_schema_matches_mcp_file() =>
        AssertSchemaFileMatches("list_projects_by_skill.json", ResumeToolInputSchemas.ListProjectsBySkillJson);

    [Fact]
    public void Get_metrics_schema_matches_mcp_file() =>
        AssertSchemaFileMatches("get_metrics.json", ResumeToolInputSchemas.GetMetricsJson);

    [Fact]
    public void List_recent_shipped_schema_matches_mcp_file() =>
        AssertSchemaFileMatches("list_recent_shipped.json", ResumeToolInputSchemas.ListRecentShippedJson);

    [Fact]
    public void Get_narrative_schema_matches_mcp_file() =>
        AssertSchemaFileMatches("get_narrative.json", ResumeToolInputSchemas.GetNarrativeJson);

    [Fact]
    public void Get_faq_schema_matches_mcp_file() =>
        AssertSchemaFileMatches("get_faq.json", ResumeToolInputSchemas.GetFaqJson);
}
