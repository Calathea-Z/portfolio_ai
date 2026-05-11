using System.Diagnostics;

namespace Portfolio.Api.Services;

internal static class ChatActivitySourceHolder
{
    internal static readonly ActivitySource Source = new("Portfolio.Api.Chat", "1.0.0");
}
