using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;
using Portfolio.Api.Models;
using Portfolio.Api.Options;

namespace Portfolio.Api.Services;

/// <summary>
/// Calls the Anthropic Messages API with streaming enabled and forwards assistant <c>text_delta</c> chunks to the response body as raw UTF-8.
/// </summary>
public sealed class AnthropicStreamService(
    IHttpClientFactory httpClientFactory,
    IOptions<AnthropicOptions> optionsAccessor
)
{
    private const string MessagesApiUrl = "https://api.anthropic.com/v1/messages";
    private const string AnthropicVersionHeader = "2023-06-01";

    private readonly AnthropicOptions _options = optionsAccessor.Value;

    /// <summary>
    /// POSTs the conversation to Anthropic and copies streamed plain text into <paramref name="responseBody"/>.
    /// </summary>
    /// <exception cref="InvalidOperationException">Upstream returned an error event or the API key is missing.</exception>
    /// <exception cref="HttpRequestException">Non-success HTTP status from Anthropic.</exception>
    public async Task StreamChatAsync(
        IReadOnlyList<ChatMessageDto> messages,
        Stream responseBody,
        CancellationToken cancellationToken
    )
    {
        if (string.IsNullOrWhiteSpace(_options.ApiKey))
            throw new InvalidOperationException("Anthropic API key is not configured.");

        var system = SystemPromptLoader.Load();
        var client = httpClientFactory.CreateClient("anthropic");

        var payload = BuildMessagesPayload(messages, system);
        var json = JsonSerializer.Serialize(payload);

        using var request = new HttpRequestMessage(HttpMethod.Post, MessagesApiUrl);
        request.Headers.TryAddWithoutValidation("x-api-key", _options.ApiKey);
        request.Headers.TryAddWithoutValidation("anthropic-version", AnthropicVersionHeader);
        request.Content = new StringContent(json, Encoding.UTF8, "application/json");

        using var response = await client.SendAsync(
            request,
            HttpCompletionOption.ResponseHeadersRead,
            cancellationToken
        );

        if (!response.IsSuccessStatusCode)
        {
            var err = await response.Content.ReadAsStringAsync(cancellationToken);
            throw new HttpRequestException($"Anthropic API error {(int)response.StatusCode}: {err}");
        }

        await using var upstream = await response.Content.ReadAsStreamAsync(cancellationToken);
        await ForwardTextDeltasAsync(upstream, responseBody, cancellationToken);
    }

    private Dictionary<string, JsonElement> BuildMessagesPayload(IReadOnlyList<ChatMessageDto> messages, string system)
    {
        return new Dictionary<string, JsonElement>
        {
            ["model"] = JsonSerializer.SerializeToElement(_options.Model),
            ["max_tokens"] = JsonSerializer.SerializeToElement(_options.MaxTokens),
            ["stream"] = JsonSerializer.SerializeToElement(true),
            ["system"] = JsonSerializer.SerializeToElement(system),
            ["messages"] = JsonSerializer.SerializeToElement(
                messages.Select(m => new { role = m.Role, content = m.Content }).ToList()
            ),
        };
    }

    /// <summary>Parses SSE lines; Anthropic sends JSON objects in <c>data:</c> lines terminated by blank lines.</summary>
    private static async Task ForwardTextDeltasAsync(
        Stream upstream,
        Stream responseBody,
        CancellationToken cancellationToken
    )
    {
        using var reader = new StreamReader(upstream, Encoding.UTF8, detectEncodingFromByteOrderMarks: false);
        var dataBuffer = new List<string>();

        async Task FlushDataEventsAsync()
        {
            if (dataBuffer.Count == 0) return;

            var dataJson = string.Join("\n", dataBuffer);
            dataBuffer.Clear();
            await ProcessSseDataLineAsync(dataJson, responseBody, cancellationToken);
        }

        while (await reader.ReadLineAsync(cancellationToken) is { } line)
        {
            if (line.StartsWith("data:", StringComparison.Ordinal))
            {
                dataBuffer.Add(line[5..].Trim());
                continue;
            }

            if (line.Length == 0)
                await FlushDataEventsAsync();
        }

        await FlushDataEventsAsync();
    }

    private static async Task ProcessSseDataLineAsync(
        string dataJson,
        Stream responseBody,
        CancellationToken cancellationToken
    )
    {
        if (string.IsNullOrWhiteSpace(dataJson)) return;

        using var doc = JsonDocument.Parse(dataJson);
        var root = doc.RootElement;

        if (!root.TryGetProperty("type", out var typeEl)) return;

        var type = typeEl.GetString();
        if (type == "error")
        {
            string? message = null;
            if (root.TryGetProperty("error", out var errorObj) && errorObj.TryGetProperty("message", out var msgEl))
                message = msgEl.GetString();

            throw new InvalidOperationException(message ?? dataJson);
        }

        if (type == "content_block_delta" && root.TryGetProperty("delta", out var delta))
        {
            if (
                delta.TryGetProperty("type", out var dt)
                && dt.GetString() == "text_delta"
                && delta.TryGetProperty("text", out var textEl)
            )
            {
                var text = textEl.GetString();
                if (!string.IsNullOrEmpty(text))
                {
                    var bytes = Encoding.UTF8.GetBytes(text);
                    await responseBody.WriteAsync(bytes, cancellationToken);
                    await responseBody.FlushAsync(cancellationToken);
                }
            }
        }
    }
}
