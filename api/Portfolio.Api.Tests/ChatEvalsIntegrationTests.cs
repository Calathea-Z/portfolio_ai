using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Portfolio.Api.Models;

namespace Portfolio.Api.Tests;

public class ChatEvalsIntegrationTests : IClassFixture<ChatEvalsWebApplicationFactory>, IDisposable
{
    private readonly ChatEvalsWebApplicationFactory _factory;
    private readonly HttpClient _client;

    public ChatEvalsIntegrationTests(ChatEvalsWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    public void Dispose() => _client.Dispose();

    [Fact]
    public async Task ChatEvals_WithValidKey_ReturnsNdjsonDone()
    {
        var request = new ChatRequest { Messages = [new ChatMessageDto { Role = "user", Content = "ping" }] };

        using var msg = new HttpRequestMessage(HttpMethod.Post, "/internal/chat-evals");
        msg.Headers.Add("X-Eval-Key", "eval-test-secret");
        msg.Content = JsonContent.Create(request);

        using var response = await _client.SendAsync(msg, HttpCompletionOption.ResponseHeadersRead);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        await using var stream = await response.Content.ReadAsStreamAsync();
        using var reader = new StreamReader(stream);

        var kinds = new List<string>();
        while (await reader.ReadLineAsync() is { } line)
        {
            if (string.IsNullOrWhiteSpace(line)) continue;
            using var doc = JsonDocument.Parse(line);
            if (doc.RootElement.TryGetProperty("kind", out var k))
                kinds.Add(k.GetString() ?? "");
        }

        Assert.Contains("text", kinds);
        Assert.Contains("done", kinds);
        Assert.Contains("usage", kinds);
    }

    [Fact]
    public async Task ChatEvals_WithBadKey_Returns401()
    {
        var request = new ChatRequest { Messages = [new ChatMessageDto { Role = "user", Content = "x" }] };
        using var msg = new HttpRequestMessage(HttpMethod.Post, "/internal/chat-evals");
        msg.Headers.Add("X-Eval-Key", "wrong");
        msg.Content = JsonContent.Create(request);

        using var response = await _client.SendAsync(msg);
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
