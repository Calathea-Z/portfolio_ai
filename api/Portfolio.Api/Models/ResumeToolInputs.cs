using System.Text.Json.Serialization;

namespace Portfolio.Api.Models;

/// <summary>Typed inputs for <c>get_role</c>; filters are optional — omit all to list every role.</summary>
public sealed record GetRoleInput
{
    [JsonPropertyName("id")]
    public string? Id { get; init; }

    [JsonPropertyName("year")]
    public int? Year { get; init; }

    [JsonPropertyName("org")]
    public string? Org { get; init; }
}

/// <summary>Typed input for <c>list_projects_by_skill</c>.</summary>
public sealed record ListProjectsBySkillInput
{
    [JsonPropertyName("skill")]
    public string? Skill { get; init; }
}

/// <summary>Typed input for <c>get_metrics</c>.</summary>
public sealed record GetMetricsInput
{
    [JsonPropertyName("id")]
    public string? Id { get; init; }
}

/// <summary>Typed input for <c>list_recent_shipped</c>.</summary>
public sealed record ListRecentShippedInput
{
    [JsonPropertyName("limit")]
    public int? Limit { get; init; }
}

/// <summary>Typed input for <c>search_resume</c>.</summary>
public sealed record SearchResumeInput
{
    [JsonPropertyName("query")]
    public string? Query { get; init; }
}

/// <summary>Typed input for <c>get_narrative</c>. No fields — call with <c>{}</c>.</summary>
public sealed record GetNarrativeInput
{
}

/// <summary>
/// Typed input for <c>get_faq</c>. Both filters optional; omit to return every FAQ entry.
/// </summary>
public sealed record GetFaqInput
{
    [JsonPropertyName("id")]
    public string? Id { get; init; }

    [JsonPropertyName("keyword")]
    public string? Keyword { get; init; }
}
