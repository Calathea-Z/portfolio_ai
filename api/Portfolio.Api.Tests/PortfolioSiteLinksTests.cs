using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Portfolio.Api.Services;

namespace Portfolio.Api.Tests;

public class PortfolioSiteLinksTests
{
    private static readonly string[] Allowed =
    [
        "http://localhost:3000",
        "https://zachsykes.dev",
        "https://www.zachsykes.dev",
        "https://portfolio-ai-gamma-nine.vercel.app",
    ];

    [Fact]
    public void Resolve_LocalOrigin_ReturnsThatOrigin()
    {
        var request = RequestWithOrigin("http://localhost:3000");

        var origin = PortfolioSiteLinks.ResolvePublicOrigin(request, Allowed);

        Assert.Equal("http://localhost:3000", origin);
    }

    [Fact]
    public void Resolve_LiveHosts_LeaveStoredUrlsAlone()
    {
        Assert.Null(PortfolioSiteLinks.ResolvePublicOrigin(RequestWithOrigin("https://zachsykes.dev"), Allowed));
        Assert.Null(PortfolioSiteLinks.ResolvePublicOrigin(RequestWithOrigin("https://www.zachsykes.dev"), Allowed));
    }

    [Fact]
    public void Resolve_PreviewOrigin_ReturnsThatOrigin()
    {
        var origin = PortfolioSiteLinks.ResolvePublicOrigin(
            RequestWithOrigin("https://portfolio-ai-gamma-nine.vercel.app"),
            Allowed);

        Assert.Equal("https://portfolio-ai-gamma-nine.vercel.app", origin);
    }

    [Fact]
    public void Resolve_UnknownOrMissingOrigin_ReturnsNull()
    {
        Assert.Null(PortfolioSiteLinks.ResolvePublicOrigin(RequestWithOrigin("https://evil.example"), Allowed));
        Assert.Null(PortfolioSiteLinks.ResolvePublicOrigin(new DefaultHttpContext().Request, Allowed));
    }

    [Fact]
    public void Rewrite_ReplacesLiveHostsAndKeepsThePath()
    {
        const string text =
            "Write-up at https://zachsykes.dev/projects/budgeting and https://www.zachsykes.dev/projects/planning-poker. GitHub stays https://github.com/Calathea-Z.";

        var rewritten = PortfolioSiteLinks.Rewrite(text, "http://localhost:3000");

        Assert.Contains("http://localhost:3000/projects/budgeting", rewritten);
        Assert.Contains("http://localhost:3000/projects/planning-poker", rewritten);
        Assert.Contains("https://github.com/Calathea-Z", rewritten);
        Assert.DoesNotContain("zachsykes.dev", rewritten);
    }

    [Fact]
    public void Rewrite_DoesNotMatchALongerHost()
    {
        const string text = "https://zachsykes.dev.evil.example/phish";

        var rewritten = PortfolioSiteLinks.Rewrite(text, "http://localhost:3000");

        Assert.Equal(text, rewritten);
    }

    [Fact]
    public void RewriteElement_UpdatesNestedAnswerText()
    {
        using var doc = JsonDocument.Parse(
            """{"answer":"The write-up is at https://zachsykes.dev/projects/budgeting."}""");

        var rewritten = PortfolioSiteLinks.RewriteElement(doc.RootElement, "http://localhost:3000/");

        Assert.Equal(
            "The write-up is at http://localhost:3000/projects/budgeting.",
            rewritten.GetProperty("answer").GetString());
    }

    private static HttpRequest RequestWithOrigin(string origin)
    {
        var context = new DefaultHttpContext();
        context.Request.Headers.Origin = origin;
        return context.Request;
    }
}
