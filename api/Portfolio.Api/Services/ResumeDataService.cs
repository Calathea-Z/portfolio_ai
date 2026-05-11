using System.Text.Json;
using Portfolio.Api.Models;

namespace Portfolio.Api.Services;

/// <summary>
/// Loads <c>Data/resume.json</c> from an embedded resource on first access and
/// caches the parsed <see cref="ResumeData"/>.
/// </summary>
/// <remarks>
/// Resume data ships with the API as an embedded resource (see
/// <c>Portfolio.Api.csproj</c>) so the agent has structured facts to cite via
/// the <c>ResumeTools</c> handlers without exposing them through the browser.
/// </remarks>
public sealed class ResumeDataService
{
    private const string ResourceSuffix = ".resume.json";

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    private readonly Lazy<ResumeData> _data;

    public ResumeDataService()
    {
        _data = new Lazy<ResumeData>(LoadFromAssembly, isThreadSafe: true);
    }

    /// <summary>The full structured resume; loaded once per process.</summary>
    public ResumeData Data => _data.Value;

    private static ResumeData LoadFromAssembly()
    {
        var assembly = typeof(ResumeDataService).Assembly;
        var resourceName = assembly
            .GetManifestResourceNames()
            .FirstOrDefault(n => n.EndsWith(ResourceSuffix, StringComparison.Ordinal))
            ?? throw new InvalidOperationException($"Embedded resource '*{ResourceSuffix}' not found.");

        using var stream = assembly.GetManifestResourceStream(resourceName)
            ?? throw new InvalidOperationException($"Could not open resource stream: {resourceName}");

        var data = JsonSerializer.Deserialize<ResumeData>(stream, JsonOptions)
            ?? throw new InvalidOperationException("Resume data deserialized to null.");

        return data;
    }
}
