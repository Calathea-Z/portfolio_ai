using System.Text.Json;
using Portfolio.Api.Models;

namespace Portfolio.Api.Services;

/// <summary>
/// Pure handlers backing the chat agent's tool calls. Each takes the model's
/// JSON input, queries <see cref="ResumeDataService"/>, and returns a
/// JSON-serializable result the model can quote back to the user.
/// </summary>
/// <remarks>
/// Handlers MUST NOT throw on bad input. Unknown tool names and validation
/// failures yield an <c>{ "error": "..." }</c> payload so the streaming loop
/// can surface the failure as a <c>tool_result</c> event and let the model
/// recover (e.g. by trying a different tool).
/// </remarks>
public sealed class ResumeTools(ResumeDataService resumeDataService, TimeProvider timeProvider)
{
    private readonly ResumeData _resume = resumeDataService.Data;
    private readonly TimeProvider _time = timeProvider;

    /// <summary>
    /// Dispatch by tool name. Unknown names return a structured error rather
    /// than throwing so the agent loop can keep streaming.
    /// </summary>
    public Task<JsonElement> RunAsync(string name, JsonElement input, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();

        JsonElement result = name switch
        {
            ResumeToolDefinitions.GetRole => GetRole(input),
            ResumeToolDefinitions.ListProjectsBySkill => ListProjectsBySkill(input),
            ResumeToolDefinitions.GetMetrics => GetMetrics(input),
            ResumeToolDefinitions.ListRecentShipped => ListRecentShipped(input),
            _ => Error($"Unknown tool '{name}'."),
        };

        return Task.FromResult(result);
    }

    private JsonElement GetRole(JsonElement input)
    {
        var id = TryGetString(input, "id");
        var org = TryGetString(input, "org");
        var year = TryGetInt(input, "year");

        if (id is null && org is null && year is null)
            return Error("Provide at least one of: id, org, year.");

        var currentYear = _time.GetUtcNow().Year;
        var matches = _resume.Roles
            .Where(r => MatchesRole(r, id, org, year, currentYear))
            .Select(r => (object)new
            {
                id = r.Id,
                title = r.Title,
                org = r.Org,
                startYear = r.StartYear,
                endYear = r.EndYear,
                remote = r.Remote,
                summary = r.Summary,
                achievements = r.Achievements,
                tech = r.Tech,
                url = r.Url,
            })
            .ToList();

        return JsonSerializer.SerializeToElement(new { items = matches, count = matches.Count });
    }

    private static bool MatchesRole(ResumeRole role, string? id, string? org, int? year, int currentYear)
    {
        if (id is not null && !string.Equals(role.Id, id, StringComparison.OrdinalIgnoreCase))
            return false;

        if (org is not null && role.Org.IndexOf(org, StringComparison.OrdinalIgnoreCase) < 0)
            return false;

        if (year is { } y)
        {
            var endYear = role.EndYear ?? currentYear;
            if (y < role.StartYear || y > endYear) return false;
        }

        return true;
    }

    private JsonElement ListProjectsBySkill(JsonElement input)
    {
        var skill = TryGetString(input, "skill");
        if (string.IsNullOrWhiteSpace(skill))
            return Error("'skill' is required.");

        var matches = _resume.Projects
            .Where(p => p.Tech.Any(t => t.Equals(skill, StringComparison.OrdinalIgnoreCase)))
            .Select(ProjectToObject)
            .ToList();

        return JsonSerializer.SerializeToElement(new { skill, items = matches, count = matches.Count });
    }

    private JsonElement GetMetrics(JsonElement input)
    {
        var id = TryGetString(input, "id");

        var items = (id is null
                ? _resume.Metrics
                : _resume.Metrics.Where(m => string.Equals(m.Id, id, StringComparison.OrdinalIgnoreCase)))
            .Select(m => (object)new
            {
                id = m.Id,
                label = m.Label,
                value = m.Value,
                unit = m.Unit,
                note = m.Note,
            })
            .ToList();

        return JsonSerializer.SerializeToElement(new { items, count = items.Count });
    }

    private JsonElement ListRecentShipped(JsonElement input)
    {
        var limit = TryGetInt(input, "limit") ?? 5;
        if (limit < 1) limit = 1;
        if (limit > 20) limit = 20;

        var items = _resume.Projects
            .Where(p => string.Equals(p.Status, "shipped", StringComparison.OrdinalIgnoreCase))
            .OrderByDescending(p => p.Year)
            .Take(limit)
            .Select(ProjectToObject)
            .ToList();

        return JsonSerializer.SerializeToElement(new { items, count = items.Count, limit });
    }

    private static object ProjectToObject(ResumeProject p) => new
    {
        id = p.Id,
        name = p.Name,
        roleId = p.RoleId,
        year = p.Year,
        status = p.Status,
        url = p.Url,
        summary = p.Summary,
        tech = p.Tech,
    };

    private static string? TryGetString(JsonElement input, string name) =>
        input.ValueKind == JsonValueKind.Object
        && input.TryGetProperty(name, out var prop)
        && prop.ValueKind == JsonValueKind.String
            ? prop.GetString()
            : null;

    private static int? TryGetInt(JsonElement input, string name) =>
        input.ValueKind == JsonValueKind.Object
        && input.TryGetProperty(name, out var prop)
        && prop.ValueKind == JsonValueKind.Number
        && prop.TryGetInt32(out var value)
            ? value
            : null;

    private static JsonElement Error(string message) =>
        JsonSerializer.SerializeToElement(new { error = message });
}
