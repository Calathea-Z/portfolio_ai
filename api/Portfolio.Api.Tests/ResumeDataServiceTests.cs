using Portfolio.Api.Services;

namespace Portfolio.Api.Tests;

public class ResumeDataServiceTests
{
    [Fact]
    public void Data_LoadsEmbeddedResumeJson()
    {
        var service = new ResumeDataService();
        var data = service.Data;

        Assert.NotNull(data);
        Assert.Equal("Zach Sykes", data.Person.Name);
        Assert.NotEmpty(data.Roles);
        Assert.NotEmpty(data.Projects);
        Assert.NotEmpty(data.Metrics);
        Assert.NotEmpty(data.Skills);
    }

    [Fact]
    public void Data_IsCached_ReturnsSameInstanceAcrossCalls()
    {
        var service = new ResumeDataService();
        var first = service.Data;
        var second = service.Data;

        Assert.Same(first, second);
    }
}
