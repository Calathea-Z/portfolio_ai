using System.Text.Json.Serialization;

namespace Portfolio.Api.Models;

/// <summary>
/// Strongly typed view of <c>Data/resume.json</c>. All factual content the
/// chat agent can cite lives here so the system prompt stays voice-only.
/// </summary>
public sealed class ResumeData
{
    [JsonPropertyName("person")]
    public ResumePerson Person { get; set; } = new();

    [JsonPropertyName("narrative")]
    public ResumeNarrative Narrative { get; set; } = new();

    [JsonPropertyName("roles")]
    public List<ResumeRole> Roles { get; set; } = [];

    [JsonPropertyName("projects")]
    public List<ResumeProject> Projects { get; set; } = [];

    [JsonPropertyName("metrics")]
    public List<ResumeMetric> Metrics { get; set; } = [];

    [JsonPropertyName("skills")]
    public List<ResumeSkill> Skills { get; set; } = [];

    [JsonPropertyName("education")]
    public List<ResumeEducation> Education { get; set; } = [];

    [JsonPropertyName("beliefs")]
    public List<string> Beliefs { get; set; } = [];

    [JsonPropertyName("faq")]
    public List<ResumeFaqEntry> Faq { get; set; } = [];
}

public sealed class ResumePerson
{
    [JsonPropertyName("name")] public string Name { get; set; } = "";
    [JsonPropertyName("summary")] public string Summary { get; set; } = "";
    [JsonPropertyName("location")] public string Location { get; set; } = "";
    [JsonPropertyName("remote")] public bool Remote { get; set; }
    [JsonPropertyName("timeZone")] public string? TimeZone { get; set; }
    [JsonPropertyName("email")] public string Email { get; set; } = "";
    [JsonPropertyName("github")] public string Github { get; set; } = "";
    [JsonPropertyName("linkedin")] public string Linkedin { get; set; } = "";
    [JsonPropertyName("freelanceSite")] public string FreelanceSite { get; set; } = "";
    [JsonPropertyName("workAuth")] public string? WorkAuth { get; set; }
    [JsonPropertyName("availability")] public string? Availability { get; set; }
    [JsonPropertyName("employmentTypes")] public List<string> EmploymentTypes { get; set; } = [];
    [JsonPropertyName("compensation")] public string? Compensation { get; set; }
    [JsonPropertyName("lookingFor")] public string LookingFor { get; set; } = "";
}

/// <summary>
/// Free-form career narrative — the origin story / bridge / carry-over framing
/// that recruiters consistently ask about and that does not fit cleanly into
/// the structured role rows.
/// </summary>
public sealed class ResumeNarrative
{
    [JsonPropertyName("originStory")] public string OriginStory { get; set; } = "";
    [JsonPropertyName("bridge")] public string Bridge { get; set; } = "";
    [JsonPropertyName("carryover")] public string Carryover { get; set; } = "";
}

public sealed class ResumeRole
{
    [JsonPropertyName("id")] public string Id { get; set; } = "";
    [JsonPropertyName("title")] public string Title { get; set; } = "";
    [JsonPropertyName("org")] public string Org { get; set; } = "";
    [JsonPropertyName("startYear")] public int StartYear { get; set; }
    [JsonPropertyName("startMonth")] public int? StartMonth { get; set; }
    [JsonPropertyName("endYear")] public int? EndYear { get; set; }
    [JsonPropertyName("endMonth")] public int? EndMonth { get; set; }
    [JsonPropertyName("remote")] public bool Remote { get; set; }
    [JsonPropertyName("url")] public string? Url { get; set; }
    [JsonPropertyName("summary")] public string Summary { get; set; } = "";
    [JsonPropertyName("achievements")] public List<string> Achievements { get; set; } = [];
    [JsonPropertyName("tech")] public List<string> Tech { get; set; } = [];
}

public sealed class ResumeProject
{
    [JsonPropertyName("id")] public string Id { get; set; } = "";
    [JsonPropertyName("name")] public string Name { get; set; } = "";
    [JsonPropertyName("roleId")] public string? RoleId { get; set; }
    [JsonPropertyName("year")] public int Year { get; set; }
    [JsonPropertyName("status")] public string Status { get; set; } = "";
    [JsonPropertyName("visibility")] public string? Visibility { get; set; }
    [JsonPropertyName("url")] public string? Url { get; set; }
    [JsonPropertyName("repoUrl")] public string? RepoUrl { get; set; }
    [JsonPropertyName("demoUrl")] public string? DemoUrl { get; set; }
    [JsonPropertyName("summary")] public string Summary { get; set; } = "";
    [JsonPropertyName("outcomes")] public List<string> Outcomes { get; set; } = [];
    [JsonPropertyName("tech")] public List<string> Tech { get; set; } = [];
}

public sealed class ResumeMetric
{
    [JsonPropertyName("id")] public string Id { get; set; } = "";
    [JsonPropertyName("label")] public string Label { get; set; } = "";
    [JsonPropertyName("value")] public double Value { get; set; }
    [JsonPropertyName("unit")] public string Unit { get; set; } = "";
    [JsonPropertyName("note")] public string? Note { get; set; }
}

public sealed class ResumeSkill
{
    [JsonPropertyName("name")] public string Name { get; set; } = "";
    [JsonPropertyName("category")] public string Category { get; set; } = "";
    [JsonPropertyName("level")] public string Level { get; set; } = "";
}

public sealed class ResumeEducation
{
    [JsonPropertyName("program")] public string Program { get; set; } = "";
    [JsonPropertyName("school")] public string School { get; set; } = "";
    [JsonPropertyName("note")] public string? Note { get; set; }
}

public sealed class ResumeFaqEntry
{
    [JsonPropertyName("id")] public string Id { get; set; } = "";
    [JsonPropertyName("question")] public string Question { get; set; } = "";
    [JsonPropertyName("answer")] public string Answer { get; set; } = "";
}
