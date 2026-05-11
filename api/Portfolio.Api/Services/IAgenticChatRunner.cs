using Portfolio.Api.Models;
using Portfolio.Api.Options;

namespace Portfolio.Api.Services;

/// <summary>Runs the resume-grounded agentic chat loop into an NDJSON stream (production chat + eval harness).</summary>
public interface IAgenticChatRunner
{
    Task RunAsync(
        IReadOnlyList<ChatMessageDto> messages,
        ResumeTools tools,
        Stream responseBody,
        NdjsonStreamFlags flags,
        CancellationToken cancellationToken
    );
}
