using Portfolio.Api.Models;

namespace Portfolio.Api.Validation;

public static class ChatValidation
{
    public const int MaxMessages = 40;
    public const int MaxContentLength = 12_000;

    /// <summary>Returns an error message, or null if valid.</summary>
    public static string? Validate(ChatRequest? request)
    {
        var messages = request?.Messages;
        if (messages is null || messages.Count == 0)
            return "messages is required and must be non-empty.";

        if (messages.Count > MaxMessages)
            return $"At most {MaxMessages} messages are allowed.";

        for (var i = 0; i < messages.Count; i++)
        {
            var m = messages[i];
            var role = m.Role?.Trim().ToLowerInvariant();
            if (role is not ("user" or "assistant"))
                return $"messages[{i}].role must be 'user' or 'assistant'.";

            if (string.IsNullOrWhiteSpace(m.Content))
                return $"messages[{i}].content must not be empty.";

            if (m.Content.Length > MaxContentLength)
                return $"messages[{i}].content exceeds maximum length ({MaxContentLength}).";
        }

        if (messages[0].Role.Trim().ToLowerInvariant() != "user")
            return "The conversation must start with a user message.";

        return null;
    }
}
