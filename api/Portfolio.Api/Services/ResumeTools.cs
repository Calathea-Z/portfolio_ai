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
            ResumeToolDefinitions.SearchResume => RunSearchResume(input),
            ResumeToolDefinitions.ListProjectsBySkill => RunListProjectsBySkill(input),
            ResumeToolDefinitions.GetMetrics => RunGetMetrics(input),
            ResumeToolDefinitions.ListRecentShipped => RunListRecentShipped(input),
            ResumeToolDefinitions.GetNarrative => RunGetNarrative(),
            ResumeToolDefinitions.GetFaq => RunGetFaq(input),
            _ => Error($"Unknown tool '{name}'."),
        };

        return Task.FromResult(result);
    }

    private JsonElement RunGetRole(JsonElement input)
    {
        if (!ResumeToolInputValidator.TryDeserializeGetRole(input, out var model, out var err) || model is null)
            return ValidationError(err ?? "deserialize_failed");

        var currentYear = _time.GetUtcNow().Year;
        var matches = _resume.Roles
            .Where(r => MatchesRole(r, model.Id, model.Org, model.Year, currentYear))
            .Select(RoleToObject)
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

    private JsonElement RunSearchResume(JsonElement input)
    {
        if (!ResumeToolInputValidator.TryDeserializeSearchResume(input, out var model, out var err) || model is null)
            return ValidationError(err ?? "deserialize_failed");

        if (string.IsNullOrWhiteSpace(model.Query))
            return Error("'query' is required.");

        var query = model.Query.Trim();
        var items = new List<object>();

        foreach (var r in _resume.Roles)
        {
            var matched = MatchRoleFields(r, query);
            if (matched.Count > 0)
                items.Add(new { kind = "role", id = r.Id, matchedFields = matched });
        }

        foreach (var p in _resume.Projects)
        {
            var matched = MatchProjectFields(p, query);
            if (matched.Count > 0)
                items.Add(new { kind = "project", id = p.Id, matchedFields = matched });
        }

        var narrativeMatched = MatchNarrativeFields(_resume.Narrative, query);
        if (narrativeMatched.Count > 0)
            items.Add(new { kind = "narrative", id = "narrative", matchedFields = narrativeMatched });

        foreach (var f in _resume.Faq)
        {
            var matched = MatchFaqFields(f, query);
            if (matched.Count > 0)
                items.Add(new { kind = "faq", id = f.Id, matchedFields = matched });
        }

        var personMatched = MatchPersonFields(_resume.Person, query);
        if (personMatched.Count > 0)
            items.Add(new { kind = "person", id = "person", matchedFields = personMatched });

        return JsonSerializer.SerializeToElement(new { query, items, count = items.Count });
    }

    private static List<string> MatchRoleFields(ResumeRole r, string query)
    {
        var fields = new List<string>();
        if (ContainsIgnoreCase(r.Title, query)) fields.Add("title");
        if (ContainsIgnoreCase(r.Org, query)) fields.Add("org");
        if (ContainsIgnoreCase(r.Summary, query)) fields.Add("summary");
        if (r.Achievements.Any(a => ContainsIgnoreCase(a, query))) fields.Add("achievements");
        if (r.Tech.Any(t => ContainsIgnoreCase(t, query))) fields.Add("tech");
        return fields;
    }

    private static List<string> MatchProjectFields(ResumeProject p, string query)
    {
        var fields = new List<string>();
        if (ContainsIgnoreCase(p.Name, query)) fields.Add("name");
        if (ContainsIgnoreCase(p.Summary, query)) fields.Add("summary");
        if (p.Outcomes.Any(o => ContainsIgnoreCase(o, query))) fields.Add("outcomes");
        if (p.Tech.Any(t => ContainsIgnoreCase(t, query))) fields.Add("tech");
        return fields;
    }

    private static List<string> MatchNarrativeFields(ResumeNarrative n, string query)
    {
        var fields = new List<string>();
        if (ContainsIgnoreCase(n.OriginStory, query)) fields.Add("originStory");
        if (ContainsIgnoreCase(n.Bridge, query)) fields.Add("bridge");
        if (ContainsIgnoreCase(n.Carryover, query)) fields.Add("carryover");
        return fields;
    }

    private static List<string> MatchFaqFields(ResumeFaqEntry f, string query)
    {
        var fields = new List<string>();
        if (ContainsIgnoreCase(f.Question, query)) fields.Add("question");
        if (ContainsIgnoreCase(f.Answer, query)) fields.Add("answer");
        return fields;
    }

    private static List<string> MatchPersonFields(ResumePerson p, string query)
    {
        var fields = new List<string>();
        if (ContainsIgnoreCase(p.Summary, query)) fields.Add("summary");
        if (ContainsIgnoreCase(p.LookingFor, query)) fields.Add("lookingFor");
        if (ContainsIgnoreCase(p.Availability, query)) fields.Add("availability");
        if (ContainsIgnoreCase(p.WorkAuth, query)) fields.Add("workAuth");
        if (ContainsIgnoreCase(p.TimeZone, query)) fields.Add("timeZone");
        if (ContainsIgnoreCase(p.Compensation, query)) fields.Add("compensation");
        if (ContainsIgnoreCase(p.PortfolioSite, query)) fields.Add("portfolioSite");
        if (ContainsIgnoreCase(p.Email, query)) fields.Add("email");
        if (ContainsIgnoreCase(p.Github, query)) fields.Add("github");
        if (ContainsIgnoreCase(p.Linkedin, query)) fields.Add("linkedin");
        if (ContainsIgnoreCase(p.FreelanceSite, query)) fields.Add("freelanceSite");
        if (p.EmploymentTypes.Any(t => ContainsIgnoreCase(t, query))) fields.Add("employmentTypes");
        return fields;
    }

    private static bool ContainsIgnoreCase(string? haystack, string needle) =>
        !string.IsNullOrEmpty(haystack) && haystack.Contains(needle, StringComparison.OrdinalIgnoreCase);

    /// <summary>
    /// Matches a stack entry to the visitor's skill phrase: exact (case-insensitive), or substring when
    /// <paramref name="skill"/> is at least two characters so ".NET" hits stack labels that contain it (including "ASP.NET Core").
    /// </summary>
    private static bool TechEntryMatchesSkill(string tech, string skill)
    {
        if (tech.Equals(skill, StringComparison.OrdinalIgnoreCase))
            return true;
        if (skill.Length < 2)
            return false;
        return tech.Contains(skill, StringComparison.OrdinalIgnoreCase);
    }

    private JsonElement RunListProjectsBySkill(JsonElement input)
    {
        if (!ResumeToolInputValidator.TryDeserializeListProjectsBySkill(input, out var model, out var err) || model is null)
            return ValidationError(err ?? "deserialize_failed");

        if (string.IsNullOrWhiteSpace(model.Skill))
            return Error("'skill' is required.");

        var skill = model.Skill.Trim();
        var matches = _resume.Projects
            .Where(p => p.Tech.Any(t => TechEntryMatchesSkill(t, skill)))
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

    private JsonElement RunGetNarrative()
    {
        var n = _resume.Narrative;
        return JsonSerializer.SerializeToElement(new
        {
            originStory = n.OriginStory,
            bridge = n.Bridge,
            carryover = n.Carryover,
        });
    }

    private JsonElement RunGetFaq(JsonElement input)
    {
        if (!ResumeToolInputValidator.TryDeserializeGetFaq(input, out var model, out var err) || model is null)
            return ValidationError(err ?? "deserialize_failed");

        IEnumerable<ResumeFaqEntry> source = _resume.Faq;

        if (!string.IsNullOrWhiteSpace(model.Id))
        {
            var id = model.Id.Trim();
            source = source.Where(f => string.Equals(f.Id, id, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrWhiteSpace(model.Keyword))
        {
            var kw = model.Keyword.Trim();
            source = source.Where(f =>
                ContainsIgnoreCase(f.Question, kw) || ContainsIgnoreCase(f.Answer, kw));
        }

        var items = source
            .Select(f => (object)new { id = f.Id, question = f.Question, answer = f.Answer })
            .ToList();

        return JsonSerializer.SerializeToElement(new { items, count = items.Count });
    }

    private static object RoleToObject(ResumeRole r) => new
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
    };

    private static object ProjectToObject(ResumeProject p) => new
    {
        id = p.Id,
        name = p.Name,
        roleId = p.RoleId,
        year = p.Year,
        status = p.Status,
        visibility = p.Visibility,
        url = p.Url,
        repoUrl = p.RepoUrl,
        demoUrl = p.DemoUrl,
        summary = p.Summary,
        outcomes = p.Outcomes,
        tech = p.Tech,
    };

    private static JsonElement ValidationError(string details) =>
        JsonSerializer.SerializeToElement(new { error = "validation_failed", details });

    private static JsonElement Error(string message) =>
        JsonSerializer.SerializeToElement(new { error = message });
}
