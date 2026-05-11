using System.Text.Json.Serialization;

namespace Portfolio.Api.Models;

/// <summary>Typed inputs for <c>get_role</c>; at least one filter required at handler level.</summary>
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
