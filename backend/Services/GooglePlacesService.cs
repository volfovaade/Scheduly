using backend.Models;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Text.Json;

namespace backend.Services
{
    /// <summary>
    /// Service for searching nearby places using Google Places API.
    /// </summary>
    public class GooglePlacesService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;

        public GooglePlacesService(HttpClient httpClient)
        {
            _httpClient = httpClient;
            _apiKey = Environment.GetEnvironmentVariable("GOOGLE_API_KEY")!;  // already validated in Program.cs
        }
        /// <summary>
        /// Searches for nearby places of specified type using Google Places API.
        /// Returns up to 3 closest places ranked by distance.
        /// </summary>
        /// 
        /// <param name="type">Place type (e.g. "restaurant", "cafe")</param>
        /// <param name="lat">Latitude coordinate</param>
        /// <param name="lng">Longitude coordinate</param>
        /// <param name="eventId">Event ID to associate with found places</param>
        /// <param name="fromTime">Start time for the place option</param>
        /// <param name="toTime">End time for the place option</param>
        /// <param name="minRating">Minimal rating for the place location</param>
        /// <param name="priceLevel">Chosen price category</param>
        /// <returns>List of generated place options</returns>
        public async Task<List<EventOption>> SearchPlacesAsync(
            string type, double lat, double lng, Guid eventId,
            DateTimeOffset fromTime, DateTimeOffset toTime,
            PriceLevel priceLevel = PriceLevel.Any, double minRating = 0.0)
        {

            // build Google Places API URL - using distance ranking
            var url = $"https://maps.googleapis.com/maps/api/place/nearbysearch/json" +
                      $"?location={lat},{lng}" +
                      $"&type={type}" +
                      $"&rankby=distance" +
                      $"&key={_apiKey}";

            if (priceLevel != PriceLevel.Any)
                url += $"&maxprice={(int)priceLevel}";

            var response = await _httpClient.GetAsync(url);
            if (!response.IsSuccessStatusCode)
            {
                return new List<EventOption>();
            }

            // parse JSON response
            var json = await response.Content.ReadAsStringAsync();
            // deserialize API response
            var data = JsonSerializer.Deserialize<GooglePlaceResponse>(json, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
            // convert Google API results to our model(take only first 3) -> might be better to do some more random algorithm
            var results = data?.Results?.Take(3)
                .Select(r => new EventOption
                {
                    Id = Guid.NewGuid(),
                    EventId = eventId,
                    Source = OptionSource.Generated,
                    PlaceName = r.Name,
                    Address = r.Vicinity,
                    Latitude = r.Geometry.Location.Lat,
                    Longitude = r.Geometry.Location.Lng,
                    TimeFrom = fromTime,
                    TimeTo = toTime
                })
                .ToList() ?? new();

            return results;
        }
    }
}