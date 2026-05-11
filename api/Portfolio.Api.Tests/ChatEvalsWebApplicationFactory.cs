using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;

namespace Portfolio.Api.Tests;

/// <summary>Test host with fake Anthropic SSE and eval API key configured.</summary>
public sealed class ChatEvalsWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseSetting("Anthropic:ApiKey", "test-anthropic-key");
        builder.UseSetting("Anthropic:Model", "claude-sonnet-4-20250514");
        builder.UseSetting("Eval:ApiKey", "eval-test-secret");
        builder.UseSetting("ChatStream:EmitUsageEvents", "true");

        builder.ConfigureTestServices(services =>
        {
            services
                .AddHttpClient("anthropic")
                .ConfigurePrimaryHttpMessageHandler(_ => new FakeAnthropicStreamHandler());
        });
    }
}
