namespace Portfolio.Api.Infrastructure;

/// <summary>
/// Derives a stable per-request string key for identifying the caller behind reverse proxies.
/// Used as the partition key for rate limiting and daily token budgeting so both mechanisms count the same logical client.
/// </summary>
/// <remarks>
/// When the API sits behind a proxy or load balancer that terminates TLS, <see cref="HttpContext.Connection"/>'s remote IP may be the proxy’s address.
/// This type prefers the first hop in <c>X-Forwarded-For</c> when present (standard for forwarded clients).
/// Trust only proxies you control; a hostile client can spoof <c>X-Forwarded-For</c> if it reaches the app directly without stripping/overwriting at the edge.
/// </remarks>
internal static class ClientIdentity
{
    /// <summary>Returns the client key used by the per-minute chat rate limiter policy (<c>chat-per-ip</c>).</summary>
    public static string ForRateLimit(HttpContext context) => NormalizeClientIp(context);

    /// <summary>Returns the client key used by <see cref="Portfolio.Api.Services.DailyTokenBudgetService"/> for daily estimated-token caps.</summary>
    public static string ForBudget(HttpContext context) => NormalizeClientIp(context);

    /// <summary>
    /// Resolves the caller identity as an IP-like string: first entry of <c>X-Forwarded-For</c> if valid, otherwise <see cref="ConnectionInfo.RemoteIpAddress"/>, or <c>unknown</c>.
    /// </summary>
    private static string NormalizeClientIp(HttpContext context)
    {
        if (context.Request.Headers.TryGetValue("X-Forwarded-For", out var forwarded))
        {
            var first = forwarded.ToString().Split(',')[0].Trim();
            if (!string.IsNullOrWhiteSpace(first))
            {
                return first;
            }
        }

        return context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    }
}
