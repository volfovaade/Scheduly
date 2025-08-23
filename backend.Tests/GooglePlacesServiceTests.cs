using backend.Models;
using backend.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.VisualStudio.TestPlatform.Utilities;
using Moq;
using Moq.Protected;
using System.Net;
using System.Text;
using System.Text.Json;
using Xunit.Abstractions;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace backend.Tests
{
    public class GooglePlacesServiceTests
    {
        private HttpClient CreateHttpClientWithResponse(string json, HttpStatusCode statusCode = HttpStatusCode.OK)
        {
            var handlerMock = new Mock<HttpMessageHandler>(MockBehavior.Strict);
            handlerMock
                .Protected()   //!!!! I do not have any protected classes but in case
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>())
                .ReturnsAsync(new HttpResponseMessage
                {
                    StatusCode = statusCode,
                    Content = new StringContent(json, Encoding.UTF8, "application/json")
                });

            return new HttpClient(handlerMock.Object);
        }
        private IConfiguration CreateConfiguration(string apiKey = "test_api_key")
        {
            var mockConfig = new Mock<IConfiguration>();
            mockConfig.Setup(c => c[It.Is<string>(s => s == "GoogleApiKey")])
                      .Returns(apiKey);
            return mockConfig.Object;
        }

        [Fact]
        public async Task SearchPlacesAsync_ReturnsTop3Results()
        {
            // Arrange
            var sampleJson = JsonSerializer.Serialize(new GooglePlaceResponse
            {
                Results = new List<GooglePlaceResult>
            {
                new GooglePlaceResult { Name = "Place 1", Vicinity = "Address 1", Geometry = new Geometry { Location = new Location { Lat = 1, Lng = 1 } } },
                new GooglePlaceResult { Name = "Place 2", Vicinity = "Address 2", Geometry = new Geometry { Location = new Location { Lat = 2, Lng = 2 } } },
                new GooglePlaceResult { Name = "Place 3", Vicinity = "Address 3", Geometry = new Geometry { Location = new Location { Lat = 3, Lng = 3 } } },
                new GooglePlaceResult { Name = "Place 4", Vicinity = "Address 4", Geometry = new Geometry { Location = new Location { Lat = 4, Lng = 4 } } }
            }
            });

            var httpClient = CreateHttpClientWithResponse(sampleJson);
            var config = CreateConfiguration();
            var service = new GooglePlacesService(httpClient, config);

            var eventId = Guid.NewGuid();
            var fromTime = DateTime.UtcNow;
            var toTime = DateTime.UtcNow.AddHours(2);

            // Act
            var result = await service.SearchPlacesAsync("cafe", 50.0, 14.0, eventId, fromTime, toTime);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(3, result.Count);
            Assert.All(result, r =>
            {
                Assert.Equal(eventId, r.EventId);
                Assert.Equal(fromTime, r.TimeFrom);
                Assert.Equal(toTime, r.TimeTo);
                Assert.False(string.IsNullOrEmpty(r.PlaceName));
                Assert.False(string.IsNullOrEmpty(r.Address));
                Assert.NotNull(r.Location);
            });
            Assert.Equal("Place 1", result[0].PlaceName);
            Assert.Equal("Place 3", result[2].PlaceName); // order preserved from API
        }

        [Fact]
        public async Task SearchPlacesAsync_WhenHttpFails_ReturnsEmptyList()
        {
            // Arrange
            var httpClient = CreateHttpClientWithResponse("{}", HttpStatusCode.BadRequest);
            var config = CreateConfiguration();
            var service = new GooglePlacesService(httpClient, config);

            // Act
            var result = await service.SearchPlacesAsync("restaurant", 50.0, 14.0, Guid.NewGuid(), DateTime.UtcNow, DateTime.UtcNow.AddHours(1));

            // Assert
            Assert.NotNull(result);
            Assert.Empty(result);
        }

        [Fact]
        public async Task SearchPlacesAsync_WhenJsonIsMalformed_ReturnsEmptyList()
        {
            // Arrange
            var malformedJson = "{ invalid json";
            var httpClient = CreateHttpClientWithResponse(malformedJson);
            var config = CreateConfiguration();
            var service = new GooglePlacesService(httpClient, config);

            // Act & Assert
            await Assert.ThrowsAsync<JsonException>(() =>
                service.SearchPlacesAsync("parc", 50.0, 14.0, Guid.NewGuid(), DateTime.UtcNow, DateTime.UtcNow.AddHours(1)));
        }
    }
}