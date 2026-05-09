using Portfolio.Api.Models;
using Portfolio.Api.Validation;

namespace Portfolio.Api.Tests;

public class ChatValidationTests
{
    [Fact]
    public void Validate_ReturnsError_WhenRequestIsNull()
    {
        var error = ChatValidation.Validate(null);
        Assert.Equal("messages is required and must be non-empty.", error);
    }

    [Fact]
    public void Validate_ReturnsError_WhenMessagesIsEmpty()
    {
        var error = ChatValidation.Validate(new ChatRequest { Messages = [] });
        Assert.Equal("messages is required and must be non-empty.", error);
    }

    [Fact]
    public void Validate_ReturnsError_WhenMessagesExceedMaximum()
    {
        var request = new ChatRequest
        {
            Messages = Enumerable
                .Range(0, ChatValidation.MaxMessages + 1)
                .Select(_ => new ChatMessageDto { Role = "user", Content = "x" })
                .ToList(),
        };

        var error = ChatValidation.Validate(request);
        Assert.Equal($"At most {ChatValidation.MaxMessages} messages are allowed.", error);
    }

    [Theory]
    [InlineData("system")]
    [InlineData("tool")]
    [InlineData("")]
    public void Validate_ReturnsError_WhenRoleIsInvalid(string role)
    {
        var request = new ChatRequest
        {
            Messages = [new ChatMessageDto { Role = role, Content = "hello" }],
        };

        var error = ChatValidation.Validate(request);
        Assert.Equal("messages[0].role must be 'user' or 'assistant'.", error);
    }

    [Fact]
    public void Validate_ReturnsError_WhenContentIsEmpty()
    {
        var request = new ChatRequest
        {
            Messages = [new ChatMessageDto { Role = "user", Content = " " }],
        };

        var error = ChatValidation.Validate(request);
        Assert.Equal("messages[0].content must not be empty.", error);
    }

    [Fact]
    public void Validate_ReturnsError_WhenContentExceedsMaximumLength()
    {
        var request = new ChatRequest
        {
            Messages =
            [
                new ChatMessageDto
                {
                    Role = "user",
                    Content = new string('x', ChatValidation.MaxContentLength + 1),
                },
            ],
        };

        var error = ChatValidation.Validate(request);
        Assert.Equal(
            $"messages[0].content exceeds maximum length ({ChatValidation.MaxContentLength}).",
            error
        );
    }

    [Fact]
    public void Validate_ReturnsError_WhenFirstMessageIsNotUser()
    {
        var request = new ChatRequest
        {
            Messages =
            [
                new ChatMessageDto { Role = "assistant", Content = "Hello" },
                new ChatMessageDto { Role = "user", Content = "Question" },
            ],
        };

        var error = ChatValidation.Validate(request);

        Assert.Equal("The conversation must start with a user message.", error);
    }

    [Fact]
    public void Validate_ReturnsNull_ForValidRequest()
    {
        var request = new ChatRequest
        {
            Messages =
            [
                new ChatMessageDto { Role = "user", Content = "Hi Zach" },
                new ChatMessageDto { Role = "assistant", Content = "Hello there" },
            ],
        };

        var error = ChatValidation.Validate(request);

        Assert.Null(error);
    }
}
