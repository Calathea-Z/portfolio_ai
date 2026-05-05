using Portfolio.Api;

var builder = WebApplication.CreateBuilder(args);

builder
    .Services.AddOptions<AnthropicOptions>()
    .Configure<IConfiguration>(
        (options, configuration) =>
        {
            configuration.GetSection(AnthropicOptions.SectionName).Bind(options);

            // Backward-compatible fallback for accidental "Anthrpic" key typo in secrets.
            if (string.IsNullOrWhiteSpace(options.ApiKey) || string.IsNullOrWhiteSpace(options.Model))
            {
                configuration.GetSection("Anthrpic").Bind(options);
            }
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
builder.Services.AddHttpClient("anthropic");
builder.Services.AddSingleton<AnthropicStreamService>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

const string CorsPolicy = "web";
builder.Services.AddCors(options =>
{
    options.AddPolicy(
        CorsPolicy,
        policy =>
        {
            policy
                .WithOrigins("http://localhost:3000", "https://zach.dev")
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
});

var app = builder.Build();

app.UseCors(CorsPolicy);

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.MapPost(
        "/chat",
        async (HttpContext http, ChatRequest body, AnthropicStreamService anthropic, CancellationToken ct) =>
        {
            var validationError = ChatValidation.Validate(body);
            if (validationError is not null)
            {
                http.Response.StatusCode = StatusCodes.Status400BadRequest;
                await http.Response.WriteAsJsonAsync(new { error = validationError }, cancellationToken: ct);
                return;
            }

            http.Response.ContentType = "text/plain; charset=utf-8";
            http.Response.Headers.CacheControl = "no-store";

            try
            {
                await anthropic.StreamChatAsync(body.Messages, http.Response.Body, ct);
            }
            catch (Exception ex)
            {
                if (http.Response.HasStarted) throw;

                http.Response.StatusCode = StatusCodes.Status502BadGateway;
                http.Response.ContentType = "application/json; charset=utf-8";
                await http.Response.WriteAsJsonAsync(new { error = ex.Message }, cancellationToken: ct);
            }
        })
    .WithName("Chat")
    .WithOpenApi()
    .DisableAntiforgery();

app.Run();
