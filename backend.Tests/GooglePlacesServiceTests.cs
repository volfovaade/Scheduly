using backend.Models;
using Moq;
using Moq.Protected;
using System.Net;
using System.Text;
using System.Text.Json;
using backend.Services;

namespace backend.Tests
{
    public class GooglePlacesServiceTests
    {
        private HttpClient CreateHttpClientWithResponse(string json, HttpStatusCode statusCode = HttpStatusCode.OK)
        {
            var handlerMock = new Mock<HttpMessageHandler>(MockBehavior.Strict);
            handlerMock
                .Protected()
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

        private string BuildSampleJson(int count)
        {
            var results = Enumerable.Range(1, count).Select(i =>
                new GooglePlace
                {
                    Name = $"Place {i}",
                    Vicinity = $"Address {i}",
                    Rating = 4.0 + (i * 0.1),
                    Geometry = new Geometry { Location = new Location { Lat = i, Lng = i } }
                }).ToList();

            return JsonSerializer.Serialize(new GooglePlaceResponse { Results = results });
        }

        // ---------------------------------------------------------------
        // 1. Returns top 3 results even when API returns more
        // ---------------------------------------------------------------
        [Fact]
        public async Task SearchPlacesAsync_ReturnsTop3Results()
        {
            var httpClient = CreateHttpClientWithResponse(BuildSampleJson(4));
            var service = new GooglePlacesService(httpClient);
            var eventId = Guid.NewGuid();
            var from = DateTimeOffset.UtcNow;
            var to = from.AddHours(2);

            var result = await service.SearchPlacesAsync("cafe", 50.0, 14.0, eventId, from, to);

            Assert.NotNull(result);
            Assert.Equal(3, result.Count);
        }

        // ---------------------------------------------------------------
        // 2. Returned options have correct EventId, TimeFrom, TimeTo
        // ---------------------------------------------------------------
        [Fact]
        public async Task SearchPlacesAsync_ResultsHaveCorrectEventMetadata()
        {
            var httpClient = CreateHttpClientWithResponse(BuildSampleJson(2));
            var service = new GooglePlacesService(httpClient);
            var eventId = Guid.NewGuid();
            var from = DateTimeOffset.UtcNow;
            var to = from.AddHours(3);

            var result = await service.SearchPlacesAsync("restaurant", 50.0, 14.0, eventId, from, to);

            Assert.All(result, r =>
            {
                Assert.Equal(eventId, r.EventId);
                Assert.Equal(from, r.TimeFrom);
                Assert.Equal(to, r.TimeTo);
            });
        }

        // ---------------------------------------------------------------
        // 3. Returned options have non-empty names and addresses
        // ---------------------------------------------------------------
        [Fact]
        public async Task SearchPlacesAsync_ResultsHaveNonEmptyPlaceNameAndAddress()
        {
            var httpClient = CreateHttpClientWithResponse(BuildSampleJson(3));
            var service = new GooglePlacesService(httpClient);

            var result = await service.SearchPlacesAsync("bar", 50.0, 14.0, Guid.NewGuid(),
                DateTimeOffset.UtcNow, DateTimeOffset.UtcNow.AddHours(2));

            Assert.All(result, r =>
            {
                Assert.False(string.IsNullOrWhiteSpace(r.PlaceName));
                Assert.False(string.IsNullOrWhiteSpace(r.Address));
            });
        }

        // ---------------------------------------------------------------
        // 4. Order is preserved from API response
        // ---------------------------------------------------------------
        [Fact]
        public async Task SearchPlacesAsync_PreservesOrderFromApi()
        {
            var httpClient = CreateHttpClientWithResponse(BuildSampleJson(4));
            var service = new GooglePlacesService(httpClient);

            var result = await service.SearchPlacesAsync("cafe", 50.0, 14.0, Guid.NewGuid(),
                DateTimeOffset.UtcNow, DateTimeOffset.UtcNow.AddHours(2));

            Assert.Equal("Place 1", result[0].PlaceName);
            Assert.Equal("Place 2", result[1].PlaceName);
            Assert.Equal("Place 3", result[2].PlaceName);
        }

        // ---------------------------------------------------------------
        // 5. Each result has a unique generated Id
        // ---------------------------------------------------------------
        [Fact]
        public async Task SearchPlacesAsync_EachResultHasUniqueId()
        {
            var httpClient = CreateHttpClientWithResponse(BuildSampleJson(3));
            var service = new GooglePlacesService(httpClient);

            var result = await service.SearchPlacesAsync("museum", 50.0, 14.0, Guid.NewGuid(),
                DateTimeOffset.UtcNow, DateTimeOffset.UtcNow.AddHours(2));

            var ids = result.Select(r => r.Id).ToList();
            Assert.Equal(ids.Count, ids.Distinct().Count());
        }

        // ---------------------------------------------------------------
        // 6. Source is set to Generated
        // ---------------------------------------------------------------
        [Fact]
        public async Task SearchPlacesAsync_ResultsHaveGeneratedSource()
        {
            var httpClient = CreateHttpClientWithResponse(BuildSampleJson(2));
            var service = new GooglePlacesService(httpClient);

            var result = await service.SearchPlacesAsync("hotel", 50.0, 14.0, Guid.NewGuid(),
                DateTimeOffset.UtcNow, DateTimeOffset.UtcNow.AddHours(2));

            Assert.All(result, r => Assert.Equal(OptionSource.Generated, r.Source));
        }

        // ---------------------------------------------------------------
        // 7. Returns fewer than 3 when API returns fewer results
        // ---------------------------------------------------------------
        [Fact]
        public async Task SearchPlacesAsync_ReturnsFewerThan3WhenApiReturnsLess()
        {
            var httpClient = CreateHttpClientWithResponse(BuildSampleJson(2));
            var service = new GooglePlacesService(httpClient);

            var result = await service.SearchPlacesAsync("cafe", 50.0, 14.0, Guid.NewGuid(),
                DateTimeOffset.UtcNow, DateTimeOffset.UtcNow.AddHours(2));

            Assert.Equal(2, result.Count);
        }

        // ---------------------------------------------------------------
        // 8. Returns empty list when API returns empty results array
        // ---------------------------------------------------------------
        [Fact]
        public async Task SearchPlacesAsync_WhenApiReturnsEmptyResults_ReturnsEmptyList()
        {
            var emptyJson = JsonSerializer.Serialize(new GooglePlaceResponse { Results = new List<GooglePlace>() });
            var httpClient = CreateHttpClientWithResponse(emptyJson);
            var service = new GooglePlacesService(httpClient);

            var result = await service.SearchPlacesAsync("parc", 50.0, 14.0, Guid.NewGuid(),
                DateTimeOffset.UtcNow, DateTimeOffset.UtcNow.AddHours(2));

            Assert.NotNull(result);
            Assert.Empty(result);
        }

        // ---------------------------------------------------------------
        // 9. Returns empty list on HTTP failure (400)
        // ---------------------------------------------------------------
        [Fact]
        public async Task SearchPlacesAsync_WhenHttpFails_ReturnsEmptyList()
        {
            var httpClient = CreateHttpClientWithResponse("{}", HttpStatusCode.BadRequest);
            var service = new GooglePlacesService(httpClient);

            var result = await service.SearchPlacesAsync("restaurant", 50.0, 14.0, Guid.NewGuid(),
                DateTimeOffset.UtcNow, DateTimeOffset.UtcNow.AddHours(1));

            Assert.NotNull(result);
            Assert.Empty(result);
        }

        // ---------------------------------------------------------------
        // 10. Returns empty list on HTTP 500 Internal Server Error
        // ---------------------------------------------------------------
        [Fact]
        public async Task SearchPlacesAsync_WhenServerError_ReturnsEmptyList()
        {
            var httpClient = CreateHttpClientWithResponse("{}", HttpStatusCode.InternalServerError);
            var service = new GooglePlacesService(httpClient);

            var result = await service.SearchPlacesAsync("bar", 50.0, 14.0, Guid.NewGuid(),
                DateTimeOffset.UtcNow, DateTimeOffset.UtcNow.AddHours(1));

            Assert.NotNull(result);
            Assert.Empty(result);
        }

        // ---------------------------------------------------------------
        // 11. Throws JsonException on malformed JSON
        // ---------------------------------------------------------------
        [Fact]
        public async Task SearchPlacesAsync_WhenJsonIsMalformed_ThrowsJsonException()
        {
            var httpClient = CreateHttpClientWithResponse("{ invalid json");
            var service = new GooglePlacesService(httpClient);

            await Assert.ThrowsAsync<JsonException>(() =>
                service.SearchPlacesAsync("parc", 50.0, 14.0, Guid.NewGuid(),
                    DateTimeOffset.UtcNow, DateTimeOffset.UtcNow.AddHours(1)));
        }

        // ---------------------------------------------------------------
        // 12. Coordinates are correctly mapped from API response
        // ---------------------------------------------------------------
        [Fact]
        public async Task SearchPlacesAsync_CoordinatesAreMappedCorrectly()
        {
            var json = JsonSerializer.Serialize(new GooglePlaceResponse
            {
                Results = new List<GooglePlace>
                {
                    new GooglePlace
                    {
                        Name = "Test Place",
                        Vicinity = "Test Address",
                        Geometry = new Geometry { Location = new Location { Lat = 50.0875, Lng = 14.4213 } }
                    }
                }
            });

            var httpClient = CreateHttpClientWithResponse(json);
            var service = new GooglePlacesService(httpClient);

            var result = await service.SearchPlacesAsync("cafe", 50.0, 14.0, Guid.NewGuid(),
                DateTimeOffset.UtcNow, DateTimeOffset.UtcNow.AddHours(2));

            Assert.Single(result);
            Assert.Equal(50.0875, result[0].Latitude);
            Assert.Equal(14.4213, result[0].Longitude);
        }

        // ---------------------------------------------------------------
        // 13. Works correctly with different place types
        // ---------------------------------------------------------------
        [Theory]
        [InlineData("cafe")]
        [InlineData("restaurant")]
        [InlineData("bar")]
        [InlineData("museum")]
        [InlineData("gym")]
        public async Task SearchPlacesAsync_WorksWithDifferentPlaceTypes(string placeType)
        {
            var httpClient = CreateHttpClientWithResponse(BuildSampleJson(3));
            var service = new GooglePlacesService(httpClient);

            var result = await service.SearchPlacesAsync(placeType, 50.0, 14.0, Guid.NewGuid(),
                DateTimeOffset.UtcNow, DateTimeOffset.UtcNow.AddHours(2));

            Assert.NotNull(result);
            Assert.Equal(3, result.Count);
        }
    }
}