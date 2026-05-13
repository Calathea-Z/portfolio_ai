using System.Net;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.Extensions.Options;
using Polly;
using Polly.Extensions.Http;
using Portfolio.Api.Infrastructure;
using Portfolio.Api.Options;
using Portfolio.Api.Services;

// -----------------------------------------------------------------------------
// Pipeline: configure services, build the app, register middleware, map routes.
//
// Project demo endpoint convention
// --------------------------------
// Every featured-project demo (see web/lib/projects.ts) is served from a single
// route shape: POST /projects/{slug}. All such endpoints MUST chain
// .RequireRateLimiting("chat-per-ip") so abuse protection and the daily token
// budget apply uniformly. Use ProjectEndpointExtensions.MapProjectDemo to
// register a new demo in one line; do not hand-roll the wiring per project.
// -----------------------------------------------------------------------------

var builder = WebApplication.CreateBuilder(args);

// --- Anthropic (Messages API): bind appsettings + enforce ApiKey/Model at startup ---
builder
    .Services.AddOptions<AnthropicOptions>()
    .Configure<IConfiguration>(
        (options, configuration) =>
        {
            configuration.GetSection(AnthropicOptions.SectionName).Bind(options);
        }
    )
    .ValidateDataAnnotations()
    .Validate(
        options => !string.IsNullOrWhiteSpace(options.ApiKey),
        "Anthropic:ApiKey must be configured via user secrets or environment variables."
    )
    .Validate(
        options => !string.IsNullOrWhiteSpace(options.Model),
        "Anthropic:Model must be configured."
    )
    .ValidateOnStart();

builder.Services.Configure<ReflectionOptions>(builder.Configuration.GetSection(ReflectionOptions.SectionName));
builder.Services.Configure<EvalOptions>(builder.Configuration.GetSection(EvalOptions.SectionName));

// --- Forwarded headers: rewrite RemoteIpAddress to the real client IP, but ONLY when the
// request arrived from a proxy we explicitly trust. Empty by default — see ForwardedHeadersConfig. ---
var forwardedConfig = builder.Configuration
    .GetSection(ForwardedHeadersConfig.SectionName)
    .Get<ForwardedHeadersConfig>() ?? new ForwardedHeadersConfig();

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.ForwardLimit = forwardedConfig.ForwardLimit;
    options.KnownProxies.Clear();
    options.KnownNetworks.Clear();

    foreach (var proxy in forwardedConfig.KnownProxies)
    {
        if (IPAddress.TryParse(proxy, out var ip))
            options.KnownProxies.Add(ip);
    }

    foreach (var network in forwardedConfig.KnownNetworks)
    {
        var parts = network.Split('/', 2);
        if (parts.Length == 2
            && IPAddress.TryParse(parts[0], out var prefix)
            && int.TryParse(parts[1], out var prefixLength))
        {
            options.KnownNetworks.Add(new Microsoft.AspNetCore.HttpOverrides.IPNetwork(prefix, prefixLength));
        }
    }
});

// --- Typed HttpClient + chat-related singletons ---
// Retries apply only to SendAsync before the response body is consumed (ResponseHeadersRead in stream service).
builder
    .Services.AddHttpClient("anthropic")
    .ConfigureHttpClient(c => c.Timeout = TimeSpan.FromSeconds(120))
    .AddPolicyHandler(
        HttpPolicyExtensions
            .HandleTransientHttpError()
            .OrResult(r => r.StatusCode == HttpStatusCode.TooManyRequests)
            .WaitAndRetryAsync(3, attempt => TimeSpan.FromSeconds(Math.Pow(2, attempt)))
    );

builder.Services.AddSingleton<AnthropicStreamService>();
builder.Services.AddSingleton<IAgenticChatRunner>(sp => sp.GetRequiredService<AnthropicStreamService>());
builder.Services.AddSingleton<TimeProvider>(TimeProvider.System);
builder.Services.AddSingleton<DailyTokenBudgetService>();
builder.Services.AddSingleton<ResumeDataService>();
builder.Services.AddSingleton<ResumeTools>();
builder.Services.AddScoped<ChatOrchestrationService>();

// --- MVC-style API controllers (see Controllers/) ---
builder.Services.AddControllers();

// --- OpenAPI / Swagger (development only; see middleware below) ---
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// --- Per-IP short-window rate limit (see ChatProtection:RequestsPerMinutePerIp) ---
builder.Services.AddRateLimiter(options =>
{
    var permitLimit = builder.Configuration.GetValue("ChatProtection:RequestsPerMinutePerIp", 20);
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("chat-per-ip", context =>
    {
        var key = ClientIdentity.ForRateLimit(context);
        return RateLimitPartition.GetFixedWindowLimiter(
            key,
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = permitLimit,
                Window = TimeSpan.FromMinutes(1),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 0,
                AutoReplenishment = true,
            }
        );
    });
});

// --- CORS: web UI origin(s); must align with NEXT_PUBLIC_CHAT_API_URL on the client. ---
// Fallback is dev-only (localhost). If the config section drops out in production the policy
// will simply allow nothing rather than silently permitting a domain we don't own.
const string CorsPolicy = "web";
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? (builder.Environment.IsDevelopment() ? ["http://localhost:3000"] : []);
builder.Services.AddCors(options =>
{
    options.AddPolicy(
        CorsPolicy,
        policy =>
        {
            policy
                .WithOrigins(allowedOrigins)
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
});

var app = builder.Build();

// --- Middleware order ---
// 1. Forwarded headers first so every downstream component (rate limiter, logging, etc.) sees the real client IP.
// 2. HTTPS redirection in non-Development (Dev uses plain http://localhost:5063 by default — see launchSettings).
// 3. CORS before rate limiting; both run before endpoints.
app.UseForwardedHeaders();

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors(CorsPolicy);
app.UseRateLimiter();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// --- Attribute-routed controllers ---
app.MapControllers();

app.Run();
