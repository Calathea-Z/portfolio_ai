namespace Portfolio.Api.Infrastructure;

/// <summary>
/// Derives a stable per-request string key for identifying the caller behind reverse proxies.
/// Used as the partition key for rate limiting and daily token budgeting so both mechanisms count the same logical client.
/// </summary>
/// <remarks>
/// <para>
/// This type reads <see cref="HttpContext.Connection"/>'s remote IP <b>after</b>
/// <c>UseForwardedHeaders</c> has had a chance to rewrite it. Forwarded headers are only honored when the
/// inbound proxy is registered in <c>ForwardedHeaders:KnownProxies</c> / <c>ForwardedHeaders:KnownNetworks</c>
/// (see <c>Program.cs</c>). This is the safe default: a hostile client cannot spoof <c>X-Forwarded-For</c>
/// to bypass rate limiting because the middleware ignores the header from untrusted hops.
/// </para>
/// </remarks>
internal static class ClientIdentity
{
    /// <summary>Returns the client key used by the per-minute chat rate limiter policy (<c>chat-per-ip</c>).</summary>
    public static string ForRateLimit(HttpContext context) => NormalizeClientIp(context);

    /// <summary>Returns the client key used by <see cref="Portfolio.Api.Services.DailyTokenBudgetService"/> for daily estimated-token caps.</summary>
    public static string ForBudget(HttpContext context) => NormalizeClientIp(context);

    /// <summary>
    /// Resolves the caller identity as the connection's remote IP, which <c>UseForwardedHeaders</c> has
    /// already rewritten to the real client IP for requests coming through a trusted proxy.
    /// </summary>
    private static string NormalizeClientIp(HttpContext context) =>
        context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
}
