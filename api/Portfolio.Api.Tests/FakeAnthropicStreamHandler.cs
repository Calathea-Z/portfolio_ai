using System.Net.Http.Headers;
using System.Text;

namespace Portfolio.Api.Tests;

/// <summary>Short-circuits Anthropic streaming POSTs with a minimal valid SSE transcript (one text block, end_turn).</summary>
internal sealed class FakeAnthropicStreamHandler : DelegatingHandler
{
    protected override Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request,
        CancellationToken cancellationToken
    )
    {
        _ = cancellationToken;
        var sse = new StringBuilder();
        void Event(string json) => sse.Append("data: ").Append(json).Append("\n\n");

        Event("""{"type":"message_start","message":{"usage":{"input_tokens":10,"output_tokens":0}}}""");
        Event("""{"type":"content_block_start","index":0,"content_block":{"type":"text","text":""}}""");
        Event("""{"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"Hello from stub."}}""");
        Event("""{"type":"content_block_stop","index":0}""");
        Event("""{"type":"message_delta","delta":{"stop_reason":"end_turn","usage":{"output_tokens":5}}}""");

        var response = new HttpResponseMessage(System.Net.HttpStatusCode.OK)
        {
            Content = new StreamContent(new MemoryStream(Encoding.UTF8.GetBytes(sse.ToString()))),
        };
        response.Content.Headers.ContentType = new MediaTypeHeaderValue("text/event-stream");
        return Task.FromResult(response);
    }
}
