using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;

namespace Portfolio.Api.Infrastructure;

/// <summary>
/// Registration helpers for project demo endpoints under the <c>POST /projects/{slug}</c> convention.
/// </summary>
/// <remarks>
/// Every featured-project demo in this API lives at <c>POST /projects/{slug}</c> and shares the
/// <c>chat-per-ip</c> rate-limiting policy plus the daily token budget. <see cref="MapProjectDemo"/>
/// wires both in one call so individual feature work doesn't have to reinvent the chain.
/// </remarks>
public static class ProjectEndpointExtensions
{
    /// <summary>
    /// Maps <paramref name="handler"/> to <c>POST /projects/{slug}</c> and applies the
    /// <c>chat-per-ip</c> rate limiter so abuse protection stays consistent across project demos.
    /// </summary>
    /// <param name="endpoints">The endpoint route builder (typically the <see cref="WebApplication"/>).</param>
    /// <param name="slug">The project slug segment, e.g. <c>"pr-review"</c>.</param>
    /// <param name="handler">Minimal API handler delegate.</param>
    /// <returns>The <see cref="RouteHandlerBuilder"/> so callers can attach further conventions (e.g. <c>WithName</c>).</returns>
    public static RouteHandlerBuilder MapProjectDemo(
        this IEndpointRouteBuilder endpoints,
        string slug,
        Delegate handler
    )
    {
        if (string.IsNullOrWhiteSpace(slug))
            throw new ArgumentException("Project slug must be provided.", nameof(slug));

        return endpoints
            .MapPost($"/projects/{slug}", handler)
            .RequireRateLimiting("chat-per-ip");
    }
}
