using System.Text.Json.Serialization;

namespace Portfolio.Api.Models;

public sealed class ChatRequest
{
    [JsonPropertyName("messages")]
    public List<ChatMessageDto> Messages { get; set; } = [];
}

public sealed class ChatMessageDto
{
    [JsonPropertyName("role")]
    public string Role { get; set; } = "";

    [JsonPropertyName("content")]
    public string Content { get; set; } = "";
}
