using Portfolio.Api.Services;

namespace Portfolio.Api.Tests;

public class DailyTokenBudgetServiceTests
{
    [Fact]
    public void TryCharge_AccumulatesUsageWithinSameDay()
    {
        var clock = new FakeTimeProvider(new DateTimeOffset(2026, 5, 7, 12, 0, 0, TimeSpan.Zero));
        var service = new DailyTokenBudgetService(clock);

        var firstAllowed = service.TryCharge("1.2.3.4", 30, 100, out var remainingAfterFirst);
        var secondAllowed = service.TryCharge("1.2.3.4", 60, 100, out var remainingAfterSecond);

        Assert.True(firstAllowed);
        Assert.True(secondAllowed);
        Assert.Equal(70, remainingAfterFirst);
        Assert.Equal(10, remainingAfterSecond);
    }

    [Fact]
    public void TryCharge_ResetsUsageAfterUtcDayRollover()
    {
        var clock = new FakeTimeProvider(new DateTimeOffset(2026, 5, 7, 23, 59, 0, TimeSpan.Zero));
        var service = new DailyTokenBudgetService(clock);

        var beforeMidnight = service.TryCharge("1.2.3.4", 80, 100, out var remainingBeforeMidnight);
        clock.SetUtcNow(new DateTimeOffset(2026, 5, 8, 0, 1, 0, TimeSpan.Zero));
        var afterMidnight = service.TryCharge("1.2.3.4", 80, 100, out var remainingAfterMidnight);

        Assert.True(beforeMidnight);
        Assert.True(afterMidnight);
        Assert.Equal(20, remainingBeforeMidnight);
        Assert.Equal(20, remainingAfterMidnight);
    }

    [Fact]
    public void TryCharge_ThrowsWhenEstimatedTokensNegative()
    {
        var clock = new FakeTimeProvider(new DateTimeOffset(2026, 5, 7, 12, 0, 0, TimeSpan.Zero));
        var service = new DailyTokenBudgetService(clock);

        Assert.Throws<ArgumentOutOfRangeException>(() =>
            service.TryCharge("1.2.3.4", -1, 100, out _)
        );
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void TryCharge_ThrowsWhenDailyBudgetNotPositive(int dailyBudget)
    {
        var clock = new FakeTimeProvider(new DateTimeOffset(2026, 5, 7, 12, 0, 0, TimeSpan.Zero));
        var service = new DailyTokenBudgetService(clock);

        Assert.Throws<ArgumentOutOfRangeException>(() =>
            service.TryCharge("1.2.3.4", 10, dailyBudget, out _)
        );
    }

    [Fact]
    public void Constructor_ThrowsWhenTimeProviderNull()
    {
        Assert.Throws<ArgumentNullException>(() => new DailyTokenBudgetService(null!));
    }
}
