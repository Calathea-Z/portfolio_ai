namespace Portfolio.Api;

public static class SystemPromptLoader
{
    private static string? _cached;

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
