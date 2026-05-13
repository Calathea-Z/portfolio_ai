using System.Text.Json;
using System.Text.Json.Nodes;
using Json.Schema;
using Portfolio.Api.Models;

namespace Portfolio.Api.Services;

/// <summary>
/// Validates tool <c>input</c> JSON against the same schema Anthropic receives, before handlers run.
/// </summary>
public static class ResumeToolInputValidator
{
    private static readonly Lazy<Dictionary<string, JsonSchema>> Schemas = new(BuildSchemas, isThreadSafe: true);

    private static readonly JsonSerializerOptions DeserializeOptions = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    public static bool TryValidate(string toolName, JsonElement input, out string? errorMessage)
    {
        errorMessage = null;
        if (!Schemas.Value.TryGetValue(toolName, out var schema))
            return true;

        JsonNode node;
        try
        {
            node = JsonNode.Parse(input.GetRawText()) ?? JsonValue.Create((string?)null)!;
        }
        catch (JsonException ex)
        {
            errorMessage = $"Invalid JSON: {ex.Message}";
            return false;
        }

        var result = schema.Evaluate(node, new EvaluationOptions { OutputFormat = OutputFormat.List });
        if (result.IsValid)
            return true;

        errorMessage = FormatErrors(result);
        return false;
    }

    public static bool TryDeserializeGetRole(JsonElement input, out GetRoleInput? model, out string? error)
    {
        error = null;
        model = null;
        try
        {
            model = JsonSerializer.Deserialize<GetRoleInput>(input.GetRawText(), DeserializeOptions);
            return true;
        }
        catch (JsonException ex)
        {
            error = ex.Message;
            return false;
        }
    }

    public static bool TryDeserializeListProjectsBySkill(JsonElement input, out ListProjectsBySkillInput? model, out string? error)
    {
        error = null;
        model = null;
        try
        {
            model = JsonSerializer.Deserialize<ListProjectsBySkillInput>(input.GetRawText(), DeserializeOptions);
            return true;
        }
        catch (JsonException ex)
        {
            error = ex.Message;
            return false;
        }
    }

    public static bool TryDeserializeGetMetrics(JsonElement input, out GetMetricsInput? model, out string? error)
    {
        error = null;
        model = null;
        try
        {
            model = JsonSerializer.Deserialize<GetMetricsInput>(input.GetRawText(), DeserializeOptions);
            return true;
        }
        catch (JsonException ex)
        {
            error = ex.Message;
            return false;
        }
    }

    public static bool TryDeserializeListRecentShipped(JsonElement input, out ListRecentShippedInput? model, out string? error)
    {
        error = null;
        model = null;
        try
        {
            model = JsonSerializer.Deserialize<ListRecentShippedInput>(input.GetRawText(), DeserializeOptions);
            return true;
        }
        catch (JsonException ex)
        {
            error = ex.Message;
            return false;
        }
    }

    public static bool TryDeserializeSearchResume(JsonElement input, out SearchResumeInput? model, out string? error)
    {
        error = null;
        model = null;
        try
        {
            model = JsonSerializer.Deserialize<SearchResumeInput>(input.GetRawText(), DeserializeOptions);
            return true;
        }
        catch (JsonException ex)
        {
            error = ex.Message;
            return false;
        }
    }

    public static bool TryDeserializeGetFaq(JsonElement input, out GetFaqInput? model, out string? error)
    {
        error = null;
        model = null;
        try
        {
            model = JsonSerializer.Deserialize<GetFaqInput>(input.GetRawText(), DeserializeOptions);
            return true;
        }
        catch (JsonException ex)
        {
            error = ex.Message;
            return false;
        }
    }

    private static Dictionary<string, JsonSchema> BuildSchemas()
    {
        return new Dictionary<string, JsonSchema>(StringComparer.Ordinal)
        {
            [ResumeToolDefinitions.GetRole] = JsonSchema.FromText(ResumeToolInputSchemas.GetRoleJson),
            [ResumeToolDefinitions.SearchResume] = JsonSchema.FromText(ResumeToolInputSchemas.SearchResumeJson),
            [ResumeToolDefinitions.ListProjectsBySkill] = JsonSchema.FromText(ResumeToolInputSchemas.ListProjectsBySkillJson),
            [ResumeToolDefinitions.GetMetrics] = JsonSchema.FromText(ResumeToolInputSchemas.GetMetricsJson),
            [ResumeToolDefinitions.ListRecentShipped] = JsonSchema.FromText(ResumeToolInputSchemas.ListRecentShippedJson),
            [ResumeToolDefinitions.GetNarrative] = JsonSchema.FromText(ResumeToolInputSchemas.GetNarrativeJson),
            [ResumeToolDefinitions.GetFaq] = JsonSchema.FromText(ResumeToolInputSchemas.GetFaqJson),
        };
    }

    private static string FormatErrors(EvaluationResults result)
    {
        if (result.Errors is { Count: > 0 } errs)
            return "validation_failed: " + string.Join("; ", errs.Select(kv => $"{kv.Key}: {kv.Value}").Take(8));

        return "validation_failed";
    }
}
