namespace Portfolio.Api.Models;

/// <summary>
/// One dictionary row: cumulative estimated tokens for a client on a given UTC calendar day.
/// </summary>
internal sealed record DailyTokenBudgetEntry(int Tokens, DateOnly Day);
