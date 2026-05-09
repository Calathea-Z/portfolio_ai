using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Portfolio.Api.Models;
using Portfolio.Api.Services;

namespace Portfolio.Api.Controllers;

[ApiController]
public sealed class ChatController(ChatOrchestrationService chatOrchestration) : ControllerBase
{
    [HttpPost("/chat")]
    [EnableRateLimiting("chat-per-ip")]
    [IgnoreAntiforgeryToken]
    public Task PostAsync([FromBody] ChatRequest body, CancellationToken ct) =>
        chatOrchestration.ExecuteAsync(HttpContext, body, ct);
}
