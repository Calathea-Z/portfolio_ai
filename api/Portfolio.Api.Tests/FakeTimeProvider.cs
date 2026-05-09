namespace Portfolio.Api.Tests;

internal sealed class FakeTimeProvider(DateTimeOffset now) : TimeProvider
{
    private DateTimeOffset _utcNow = now;

    public override DateTimeOffset GetUtcNow() => _utcNow;

    public void SetUtcNow(DateTimeOffset next) => _utcNow = next;
}
