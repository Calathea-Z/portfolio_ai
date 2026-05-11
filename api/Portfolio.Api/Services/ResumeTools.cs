using System.Text.Json;
using Portfolio.Api.Models;

namespace Portfolio.Api.Services;

/// <summary>
/// Pure handlers backing the chat agent's tool calls. Each takes the model's
/// JSON input, validates against <see cref="ResumeToolInputValidator"/>, then
/// queries <see cref="ResumeDataService"/> and returns JSON the model can cite.
/// </summary>
public sealed class ResumeTools(ResumeDataService resumeDataService, TimeProvider timeProvider)
{
    private readonly ResumeData _resume = resumeDataService.Data;
    private readonly TimeProvider _time = timeProvider;

    /// <summary>
    /// Dispatch by tool name. Unknown names and validation failures yield structured
    /// <c>{ "error": ... }</c> payloads so the streaming loop can emit recoverable tool_result rows.
    /// </summary>
    public Task<JsonElement> RunAsync(string name, JsonElement input, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();

        if (!ResumeToolInputValidator.TryValidate(name, input, out var schemaError))
            return Task.FromResult(ValidationError(schemaError!));

        JsonElement result = name switch
        {
            ResumeToolDefinitions.GetRole => RunGetRole(input),
            ResumeToolDefinitions.ListProjectsBySkill => RunListProjectsBySkill(input),
            ResumeToolDefinitions.GetMetrics => RunGetMetrics(input),
            ResumeToolDefinitions.ListRecentShipped => RunListRecentShipped(input),
            _ => Error($"Unknown tool '{name}'."),
        };

        return Task.FromResult(result);
    }

    private JsonElement RunGetRole(JsonElement input)
    {
        if (!ResumeToolInputValidator.TryDeserializeGetRole(input, out var model, out var err) || model is null)
            return ValidationError(err ?? "deserialize_failed");

        if (model.Id is null && model.Org is null && model.Year is null)
            return Error("Provide at least one of: id, org, year.");

        var currentYear = _time.GetUtcNow().Year;
        var matches = _resume.Roles
            .Where(r => MatchesRole(r, model.Id, model.Org, model.Year, currentYear))
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

    private JsonElement RunListProjectsBySkill(JsonElement input)
    {
        if (!ResumeToolInputValidator.TryDeserializeListProjectsBySkill(input, out var model, out var err) || model is null)
            return ValidationError(err ?? "deserialize_failed");

        if (string.IsNullOrWhiteSpace(model.Skill))
            return Error("'skill' is required.");

        var skill = model.Skill;
        var matches = _resume.Projects
            .Where(p => p.Tech.Any(t => t.Equals(skill, StringComparison.OrdinalIgnoreCase)))
            .Select(ProjectToObject)
            .ToList();

        return JsonSerializer.SerializeToElement(new { skill, items = matches, count = matches.Count });
    }

    private JsonElement RunGetMetrics(JsonElement input)
    {
        if (!ResumeToolInputValidator.TryDeserializeGetMetrics(input, out var model, out var err) || model is null)
            return ValidationError(err ?? "deserialize_failed");

        var id = model.Id;

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

    private JsonElement RunListRecentShipped(JsonElement input)
    {
        if (!ResumeToolInputValidator.TryDeserializeListRecentShipped(input, out var model, out var err) || model is null)
            return ValidationError(err ?? "deserialize_failed");

        var limit = model.Limit ?? 5;
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

    private static JsonElement ValidationError(string details) =>
        JsonSerializer.SerializeToElement(new { error = "validation_failed", details });

    private static JsonElement Error(string message) =>
        JsonSerializer.SerializeToElement(new { error = message });
}
