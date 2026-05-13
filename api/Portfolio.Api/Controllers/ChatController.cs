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
    [RequestSizeLimit(1_048_576)] // 1 MiB. ChatValidation caps 40 messages * 12k chars (~480 KB); this guards the raw payload.
    [IgnoreAntiforgeryToken]
    public Task PostAsync([FromBody] ChatRequest body, CancellationToken ct) =>
        chatOrchestration.ExecuteAsync(HttpContext, body, ct);
}
