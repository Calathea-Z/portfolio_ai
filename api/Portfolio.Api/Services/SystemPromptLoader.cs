using System.Collections.Concurrent;

namespace Portfolio.Api.Services;

/// <summary>
/// Loads named Anthropic system prompts from embedded resources built from <c>Prompts/*.md</c>.
/// </summary>
/// <remarks>
/// Prompt files are compiled into the assembly so their content ships with the API and is not
/// exposed by the frontend. Each prompt is keyed by its file stem (e.g. <c>"chat"</c> for
/// <c>Prompts/chat.md</c>) and cached after the first read.
/// </remarks>
public static class SystemPromptLoader
{
    private const string ResourceExtension = ".md";

    private static readonly ConcurrentDictionary<string, string> Cache = new(StringComparer.Ordinal);

    /// <summary>
    /// Returns the named system prompt, loading it once per process from the embedded resource
    /// whose name ends with <c>{name}.md</c>.
    /// </summary>
    /// <param name="name">Prompt identifier (file stem), e.g. <c>"chat"</c>.</param>
    /// <returns>The full UTF-8 text of the prompt.</returns>
    /// <exception cref="ArgumentException">The name is null or whitespace.</exception>
    /// <exception cref="InvalidOperationException">No matching embedded resource exists or the stream cannot be opened.</exception>
    public static string Load(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Prompt name must be provided.", nameof(name));

        return Cache.GetOrAdd(name, ReadFromAssembly);
    }

    private static string ReadFromAssembly(string name)
    {
        var assembly = typeof(SystemPromptLoader).Assembly;
        var suffix = "." + name + ResourceExtension;

        var resourceName = assembly
            .GetManifestResourceNames()
            .FirstOrDefault(n => n.EndsWith(suffix, StringComparison.Ordinal));
        if (resourceName is null)
            throw new InvalidOperationException($"Embedded prompt resource '{name}{ResourceExtension}' not found.");

        using var stream = assembly.GetManifestResourceStream(resourceName)
            ?? throw new InvalidOperationException($"Could not open resource stream: {resourceName}");
        using var reader = new StreamReader(stream);
        return reader.ReadToEnd();
    }
}
