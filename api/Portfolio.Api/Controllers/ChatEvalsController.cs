using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Options;
using Portfolio.Api.Models;
using Portfolio.Api.Options;
using Portfolio.Api.Services;

namespace Portfolio.Api.Controllers;

[ApiController]
[Route("internal")]
public sealed class ChatEvalsController(
    ChatOrchestrationService chatOrchestration,
    IOptions<EvalOptions> evalOptions
) : ControllerBase
{
    [HttpPost("chat-evals")]
    [DisableRateLimiting]
    [IgnoreAntiforgeryToken]
    public Task PostEvalAsync([FromBody] ChatRequest body, CancellationToken ct)
    {
        var expected = evalOptions.Value.ApiKey;
        if (string.IsNullOrWhiteSpace(expected))
        {
            Response.StatusCode = StatusCodes.Status404NotFound;
            return Task.CompletedTask;
        }

        var provided = Request.Headers["X-Eval-Key"].ToString();
        if (!string.Equals(provided, expected, StringComparison.Ordinal))
        {
            Response.StatusCode = StatusCodes.Status401Unauthorized;
            return Task.CompletedTask;
        }

        return chatOrchestration.ExecuteEvalAsync(HttpContext, body, ct);
    }
}
