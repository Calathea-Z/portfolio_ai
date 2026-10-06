using System.Text;
using System.Text.Json;

namespace Portfolio.Api.Services;

/// <summary>
/// Rewrites portfolio write-up links so chat cites the site the visitor is on.
/// Resume facts store the live hosts; a local or preview origin replaces those hosts
/// for that request only.
/// </summary>
public static class PortfolioSiteLinks
{
    /// <summary>Hosts stored in <c>resume.json</c>. Requests already on these hosts keep the stored URLs.</summary>
    private static readonly string[] CanonicalHosts = ["www.zachsykes.dev", "zachsykes.dev"];

    private static readonly string[] CanonicalPrefixes =
    [
        "https://www.zachsykes.dev",
        "http://www.zachsykes.dev",
        "https://zachsykes.dev",
        "http://zachsykes.dev",
    ];

    /// <summary>
    /// Returns the browser origin when it is an allowed CORS origin and is not already
    /// the live portfolio host. Otherwise returns null and callers leave stored URLs alone.
    /// </summary>
    public static string? ResolvePublicOrigin(HttpRequest request, IEnumerable<string> allowedOrigins)
    {
        var raw = request.Headers.Origin.ToString().Trim();
        if (string.IsNullOrWhiteSpace(raw))
            return null;

        if (!Uri.TryCreate(raw, UriKind.Absolute, out var uri))
            return null;

        if (uri.Scheme is not ("http" or "https"))
            return null;

        if (CanonicalHosts.Contains(uri.Host, StringComparer.OrdinalIgnoreCase))
            return null;

        var origin = uri.GetLeftPart(UriPartial.Authority).TrimEnd('/');
        var allowed = allowedOrigins.Any(candidate =>
            string.Equals(candidate.Trim().TrimEnd('/'), origin, StringComparison.OrdinalIgnoreCase));

        return allowed ? origin : null;
    }

    public static string Rewrite(string text, string publicOrigin)
    {
        var origin = publicOrigin.Trim().TrimEnd('/');
        if (origin.Length == 0)
            return text;

        var result = text;
        foreach (var prefix in CanonicalPrefixes)
            result = ReplacePrefix(result, prefix, origin);

        return result;
    }

    public static JsonElement RewriteElement(JsonElement element, string publicOrigin)
    {
        var json = element.GetRawText();
        var rewritten = Rewrite(json, publicOrigin);
        if (string.Equals(rewritten, json, StringComparison.Ordinal))
            return element;

        using var doc = JsonDocument.Parse(rewritten);
        return doc.RootElement.Clone();
    }

    private static string ReplacePrefix(string text, string prefix, string origin)
    {
        var builder = new StringBuilder(text.Length);
        var index = 0;
        while (index < text.Length)
        {
            var found = text.IndexOf(prefix, index, StringComparison.OrdinalIgnoreCase);
            if (found < 0)
            {
                builder.Append(text, index, text.Length - index);
                break;
            }

            var after = found + prefix.Length;
            if (after < text.Length && !IsBoundary(text[after]))
            {
                builder.Append(text, index, after - index);
                index = after;
                continue;
            }

            builder.Append(text, index, found - index);
            builder.Append(origin);
            index = after;
        }

        return builder.ToString();
    }

    private static bool IsBoundary(char value) =>
        value is '/' or '?' or '#' or '"' or '\'' or ')' or ']' or '>' or ' ' or '\n' or '\r' or '\t' or ',';
}
