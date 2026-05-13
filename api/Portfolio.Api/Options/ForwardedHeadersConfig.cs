namespace Portfolio.Api.Options;

/// <summary>
/// Configuration for <c>UseForwardedHeaders</c>. Lets ops register the edge proxies that are
/// allowed to set <c>X-Forwarded-For</c> / <c>X-Forwarded-Proto</c> on inbound requests.
/// </summary>
/// <remarks>
/// <para>
/// Empty by default — meaning the API will <b>not</b> honor forwarded headers and will rate-limit
/// by the direct connection IP.
/// When the API sits behind a reverse proxy (Azure Front Door, Cloudflare, App Gateway, Nginx,
/// etc.), populate <see cref="KnownProxies"/> with the proxy IPs or <see cref="KnownNetworks"/>
/// with the proxy CIDRs so the real client IP is honored.
/// </para>
/// </remarks>
public sealed class ForwardedHeadersConfig
{
    public const string SectionName = "ForwardedHeaders";

    /// <summary>Individual proxy IPs (IPv4 or IPv6) that are allowed to forward client info.</summary>
    public List<string> KnownProxies { get; set; } = [];

    /// <summary>Proxy networks in <c>CIDR</c> form (e.g. <c>10.0.0.0/8</c>) that are allowed to forward client info.</summary>
    public List<string> KnownNetworks { get; set; } = [];

    /// <summary>How many forwarded-header entries to honor (default 1 — the nearest proxy only).</summary>
    public int ForwardLimit { get; set; } = 1;
}
