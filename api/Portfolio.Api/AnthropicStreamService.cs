using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;

namespace Portfolio.Api;

public sealed class AnthropicStreamService(
    IHttpClientFactory httpClientFactory,
    IOptions<AnthropicOptions> optionsAccessor
)
{
    private readonly AnthropicOptions _options = optionsAccessor.Value;

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

        var payload = new Dictionary<string, JsonElement>
        {
            ["model"] = JsonSerializer.SerializeToElement(_options.Model),
            ["max_tokens"] = JsonSerializer.SerializeToElement(_options.MaxTokens),
            ["stream"] = JsonSerializer.SerializeToElement(true),
            ["system"] = JsonSerializer.SerializeToElement(system),
            ["messages"] = JsonSerializer.SerializeToElement(
                messages.Select(m => new { role = m.Role, content = m.Content }).ToList()
            ),
        };

        var json = JsonSerializer.Serialize(payload);

        using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.anthropic.com/v1/messages");
        request.Headers.TryAddWithoutValidation("x-api-key", _options.ApiKey);
        request.Headers.TryAddWithoutValidation("anthropic-version", "2023-06-01");
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

    private static async Task ForwardTextDeltasAsync(
        Stream upstream,
        Stream responseBody,
        CancellationToken cancellationToken
    )
    {
        using var reader = new StreamReader(upstream, Encoding.UTF8, detectEncodingFromByteOrderMarks: false);

        var dataBuffer = new List<string>();
        while (await reader.ReadLineAsync(cancellationToken) is { } line)
        {
            if (line.StartsWith("data:", StringComparison.Ordinal))
            {
                dataBuffer.Add(line[5..].Trim());
                continue;
            }

            if (line.Length == 0 && dataBuffer.Count > 0)
            {
                var dataJson = string.Join("\n", dataBuffer);
                dataBuffer.Clear();
                await ProcessSseDataLineAsync(dataJson, responseBody, cancellationToken);
            }
        }

        if (dataBuffer.Count > 0)
        {
            var dataJson = string.Join("\n", dataBuffer);
            await ProcessSseDataLineAsync(dataJson, responseBody, cancellationToken);
        }
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
            var msg = root.TryGetProperty("error", out var err)
                ? err.TryGetProperty("message", out var m)
                    ? m.GetString()
                    : dataJson
                : dataJson;
            throw new InvalidOperationException(msg ?? "Anthropic stream error");
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
