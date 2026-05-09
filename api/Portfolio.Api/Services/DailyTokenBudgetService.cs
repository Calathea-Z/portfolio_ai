using System.Collections.Concurrent;
using Portfolio.Api.Models;

namespace Portfolio.Api.Services;

/// <summary>
/// Tracks estimated token usage per logical client per UTC calendar day and enforces a daily cap.
/// Used by <c>/chat</c> to limit abuse and API cost alongside per-minute rate limiting.
/// </summary>
/// <remarks>
/// <para>
/// State is held in memory only: counts are not shared across processes or surviving restarts.
/// Day boundaries use <see cref="DateOnly"/> in UTC derived from <see cref="TimeProvider"/>.
/// </para>
/// </remarks>
public sealed class DailyTokenBudgetService
{
    private readonly TimeProvider _timeProvider;

    /// <summary>Keys are <c>{yyyy-MM-dd}:{clientKey}</c>; values hold running totals for that day.</summary>
    private readonly ConcurrentDictionary<string, DailyTokenBudgetEntry> _usage = new();

    public DailyTokenBudgetService(TimeProvider timeProvider)
    {
        ArgumentNullException.ThrowIfNull(timeProvider);
        _timeProvider = timeProvider;
    }

    /// <summary>
    /// Charges <paramref name="estimatedTokens"/> against today's running total for <paramref name="clientKey"/>
    /// and reports whether the total remains within <paramref name="dailyBudget"/>.
    /// </summary>
    /// <param name="clientKey">Stable identifier for the caller (e.g. IP-derived).</param>
    /// <param name="estimatedTokens">Non-negative estimate for this request (input + expected output).</param>
    /// <param name="dailyBudget">Maximum allowed sum of estimated tokens for this client for the current UTC day.</param>
    /// <param name="remaining">
    /// After this operation, <c>max(0, dailyBudget - totalTokensUsedToday)</c>.
    /// </param>
    /// <returns>
    /// True if the new total is within budget; false if it exceeds the budget.
    /// When false, the estimated tokens are still applied so the total reflects actual attempted usage.
    /// </returns>
    public bool TryCharge(string clientKey, int estimatedTokens, int dailyBudget, out int remaining)
    {
        ArgumentOutOfRangeException.ThrowIfNegative(estimatedTokens);
        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(dailyBudget);

        var day = DateOnly.FromDateTime(_timeProvider.GetUtcNow().UtcDateTime);
        PruneOlderDays(day);

        var entryKey = $"{day:yyyy-MM-dd}:{clientKey}";
        var next = _usage.AddOrUpdate(
            entryKey,
            // First request today for this key.
            _ => new DailyTokenBudgetEntry(estimatedTokens, day),
            (_, existing) =>
                // Same UTC day: accumulate. Rare mismatch (clock/tests): reset if stored day drifted.
                existing.Day == day
                    ? existing with { Tokens = existing.Tokens + estimatedTokens }
                    : new DailyTokenBudgetEntry(estimatedTokens, day)
        );

        remaining = Math.Max(0, dailyBudget - next.Tokens);
        return next.Tokens <= dailyBudget;
    }

    /// <summary>Removes entries from prior UTC days so the dictionary does not grow unbounded.</summary>
    private void PruneOlderDays(DateOnly today)
    {
        foreach (var pair in _usage)
        {
            if (pair.Value.Day != today)
            {
                _usage.TryRemove(pair.Key, out _);
            }
        }
    }
}
