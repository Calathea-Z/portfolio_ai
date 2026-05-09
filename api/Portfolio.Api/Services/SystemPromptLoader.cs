namespace Portfolio.Api.Services;

/// <summary>
/// Loads the Anthropic system prompt text from an embedded resource built from <c>Prompts/system-prompt.txt</c>.
/// </summary>
/// <remarks>
/// The file is compiled into the assembly so résumé-style instructions ship with the API and are not exposed from the browser.
/// </remarks>
public static class SystemPromptLoader
{
    private static string? _cached;

    /// <summary>
    /// Returns the system prompt, loading it once per process from the embedded resource whose name ends with <c>system-prompt.txt</c>.
    /// </summary>
    /// <returns>The full UTF-8 text of the system prompt.</returns>
    /// <exception cref="InvalidOperationException">No matching embedded resource exists or the stream cannot be opened.</exception>
    public static string Load()
    {
        if (_cached is not null) return _cached;

        var assembly = typeof(SystemPromptLoader).Assembly;
        var name = assembly
            .GetManifestResourceNames()
            .FirstOrDefault(n => n.EndsWith("system-prompt.txt", StringComparison.Ordinal));
        if (name is null)
            throw new InvalidOperationException("Embedded resource system-prompt.txt not found.");

        using var stream = assembly.GetManifestResourceStream(name)
            ?? throw new InvalidOperationException($"Could not open resource stream: {name}");
        using var reader = new StreamReader(stream);
        _cached = reader.ReadToEnd();
        return _cached;
    }
}
