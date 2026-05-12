using System.Text.Json;
using Portfolio.Api.Services;

namespace Portfolio.Api.Tests;

public class ResumeToolsTests
{
    private static ResumeTools BuildTools(DateTimeOffset? now = null)
    {
        var time = new FakeTimeProvider(now ?? new DateTimeOffset(2025, 6, 15, 0, 0, 0, TimeSpan.Zero));
        return new ResumeTools(new ResumeDataService(), time);
    }

    private static JsonElement Input(string json) => JsonDocument.Parse(json).RootElement.Clone();

    [Fact]
    public async Task GetRole_ById_ReturnsMatchingRole()
    {
        var tools = BuildTools();

        var result = await tools.RunAsync(ResumeToolDefinitions.GetRole, Input("""{ "id": "forvis-mazars" }"""), default);

        Assert.Equal(1, result.GetProperty("count").GetInt32());
        var first = result.GetProperty("items")[0];
        Assert.Equal("forvis-mazars", first.GetProperty("id").GetString());
        Assert.Equal("Forvis Mazars", first.GetProperty("org").GetString());
    }

    [Fact]
    public async Task GetRole_ByYear_IncludesOngoingRoles()
    {
        // Forvis tenure: 2023-06 to present; 2025 should match.
        var tools = BuildTools(new DateTimeOffset(2025, 6, 15, 0, 0, 0, TimeSpan.Zero));

        var result = await tools.RunAsync(ResumeToolDefinitions.GetRole, Input("""{ "year": 2025 }"""), default);

        var orgs = result.GetProperty("items").EnumerateArray()
            .Select(e => e.GetProperty("org").GetString())
            .ToList();

        Assert.Contains("Forvis Mazars", orgs);
    }

    [Fact]
    public async Task GetRole_ByYear_OutsideTenure_ReturnsEmpty()
    {
        var tools = BuildTools(new DateTimeOffset(2025, 6, 15, 0, 0, 0, TimeSpan.Zero));

        var result = await tools.RunAsync(ResumeToolDefinitions.GetRole, Input("""{ "year": 2010 }"""), default);

        Assert.Equal(0, result.GetProperty("count").GetInt32());
    }

    [Fact]
    public async Task GetRole_ByOrg_IsCaseInsensitive()
    {
        var tools = BuildTools();

        var result = await tools.RunAsync(ResumeToolDefinitions.GetRole, Input("""{ "org": "forvis" }"""), default);

        Assert.True(result.GetProperty("count").GetInt32() >= 1);
    }

    [Fact]
    public async Task GetRole_WithoutFilters_ReturnsAllRoles()
    {
        var tools = BuildTools();

        var result = await tools.RunAsync(ResumeToolDefinitions.GetRole, Input("""{}"""), default);

        Assert.False(result.TryGetProperty("error", out _), "Empty filter should enumerate all roles.");
        Assert.Equal(3, result.GetProperty("count").GetInt32());
    }

    [Fact]
    public async Task SearchResume_MatchesRoleAndProject()
    {
        var tools = BuildTools();

        var restaurant = await tools.RunAsync(ResumeToolDefinitions.SearchResume, Input("""{ "query": "pizza" }"""), default);
        Assert.False(restaurant.TryGetProperty("error", out _));
        var items = restaurant.GetProperty("items").EnumerateArray().ToList();
        Assert.Contains(items, e => e.GetProperty("kind").GetString() == "role" && e.GetProperty("id").GetString() == "ashe-pizza");

        var realTime = await tools.RunAsync(ResumeToolDefinitions.SearchResume, Input("""{ "query": "real-time" }"""), default);
        Assert.True(realTime.GetProperty("count").GetInt32() >= 1);
        var kinds = realTime.GetProperty("items").EnumerateArray().Select(e => e.GetProperty("kind").GetString()).Distinct().ToList();
        Assert.Contains("role", kinds);
        Assert.Contains("project", kinds);
    }

    [Fact]
    public async Task SearchResume_NoMatches_ReturnsEmptyItems()
    {
        var tools = BuildTools();

        var result = await tools.RunAsync(ResumeToolDefinitions.SearchResume, Input("""{ "query": "zzzznonexistent" }"""), default);

        Assert.Equal(0, result.GetProperty("count").GetInt32());
        Assert.Equal(0, result.GetProperty("items").GetArrayLength());
    }

    [Fact]
    public async Task SearchResume_EmptyQuery_ReturnsError()
    {
        var tools = BuildTools();

        var result = await tools.RunAsync(ResumeToolDefinitions.SearchResume, Input("""{ "query": "   " }"""), default);

        Assert.True(result.TryGetProperty("error", out _));
    }

    [Fact]
    public async Task SearchResume_MissingQuery_ReturnsValidationFailed()
    {
        var tools = BuildTools();

        var result = await tools.RunAsync(ResumeToolDefinitions.SearchResume, Input("""{}"""), default);

        Assert.Equal("validation_failed", result.GetProperty("error").GetString());
    }

    [Fact]
    public async Task ListProjectsBySkill_IsCaseInsensitive()
    {
        var tools = BuildTools();

        var lower = await tools.RunAsync(ResumeToolDefinitions.ListProjectsBySkill, Input("""{ "skill": "websocket" }"""), default);
        var canonical = await tools.RunAsync(ResumeToolDefinitions.ListProjectsBySkill, Input("""{ "skill": "WebSocket" }"""), default);

        Assert.Equal(canonical.GetProperty("count").GetInt32(), lower.GetProperty("count").GetInt32());
        Assert.True(lower.GetProperty("count").GetInt32() >= 1);
    }

    [Fact]
    public async Task ListProjectsBySkill_MissingSkill_ReturnsError()
    {
        var tools = BuildTools();

        var result = await tools.RunAsync(ResumeToolDefinitions.ListProjectsBySkill, Input("""{}"""), default);

        Assert.True(result.TryGetProperty("error", out _));
    }

    [Fact]
    public async Task ListProjectsBySkill_SkillWrongType_ReturnsValidationFailed()
    {
        var tools = BuildTools();

        var result = await tools.RunAsync(ResumeToolDefinitions.ListProjectsBySkill, Input("""{ "skill": 42 }"""), default);

        Assert.Equal("validation_failed", result.GetProperty("error").GetString());
    }

    [Fact]
    public async Task GetMetrics_WithoutId_ReturnsAll()
    {
        var tools = BuildTools();

        var result = await tools.RunAsync(ResumeToolDefinitions.GetMetrics, Input("""{}"""), default);

        Assert.True(result.GetProperty("count").GetInt32() >= 1);
    }

    [Fact]
    public async Task GetMetrics_WithId_ReturnsSingle()
    {
        var tools = BuildTools();

        var result = await tools.RunAsync(ResumeToolDefinitions.GetMetrics, Input("""{ "id": "yoe-professional" }"""), default);

        Assert.Equal(1, result.GetProperty("count").GetInt32());
        Assert.Equal("yoe-professional", result.GetProperty("items")[0].GetProperty("id").GetString());
    }

    [Fact]
    public async Task ListRecentShipped_RespectsLimitAndSortsDescending()
    {
        var tools = BuildTools();

        var result = await tools.RunAsync(ResumeToolDefinitions.ListRecentShipped, Input("""{ "limit": 2 }"""), default);

        Assert.True(result.GetProperty("count").GetInt32() <= 2);

        var years = result.GetProperty("items").EnumerateArray()
            .Select(e => e.GetProperty("year").GetInt32())
            .ToList();

        for (var i = 1; i < years.Count; i++)
            Assert.True(years[i - 1] >= years[i], "Projects should be sorted by year descending.");
    }

    [Fact]
    public async Task ListRecentShipped_DefaultsLimit()
    {
        var tools = BuildTools();

        var result = await tools.RunAsync(ResumeToolDefinitions.ListRecentShipped, Input("""{}"""), default);

        Assert.Equal(5, result.GetProperty("limit").GetInt32());
    }

    [Fact]
    public async Task GetNarrative_ReturnsNarrativeFields()
    {
        var tools = BuildTools();

        var result = await tools.RunAsync(ResumeToolDefinitions.GetNarrative, Input("""{}"""), default);

        Assert.False(result.TryGetProperty("error", out _));
        Assert.True(result.TryGetProperty("originStory", out var os));
        Assert.True(os.GetString()?.Length > 0);
        Assert.True(result.TryGetProperty("bridge", out _));
        Assert.True(result.TryGetProperty("carryover", out _));
    }

    [Fact]
    public async Task GetFaq_All_ReturnsMultipleEntries()
    {
        var tools = BuildTools();

        var result = await tools.RunAsync(ResumeToolDefinitions.GetFaq, Input("""{}"""), default);

        Assert.False(result.TryGetProperty("error", out _));
        Assert.True(result.GetProperty("count").GetInt32() >= 2);
    }

    [Fact]
    public async Task GetFaq_ById_ReturnsSingleEntry()
    {
        var tools = BuildTools();

        var result = await tools.RunAsync(ResumeToolDefinitions.GetFaq, Input("""{ "id": "next-role" }"""), default);

        Assert.Equal(1, result.GetProperty("count").GetInt32());
        Assert.Equal("next-role", result.GetProperty("items")[0].GetProperty("id").GetString());
    }

    [Fact]
    public async Task RunAsync_UnknownTool_ReturnsErrorWithoutThrowing()
    {
        var tools = BuildTools();

        var result = await tools.RunAsync("does_not_exist", Input("""{}"""), default);

        Assert.True(result.TryGetProperty("error", out var error));
        Assert.Contains("does_not_exist", error.GetString());
    }
}
