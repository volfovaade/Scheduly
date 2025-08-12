using backend.Models;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Text.Json;

namespace backend.Services {
    /// <summary>
    /// Service for searching nearby places using Google Places API.
    /// </summary>
    public class GooglePlacesService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _config; 

        public GooglePlacesService (HttpClient httpClient, IConfiguration config)
        {
            _httpClient = httpClient;
            _config = config;
        }
        /// <summary>
        /// Searches for nearby places of specified type using Google Places API.
        /// Returns up to 3 closest places ranked by distance.
        /// </summary>
        /// <param name="type">Place type (e.g. "restaurant", "cafe")</param>
        /// <param name="lat">Latitude coordinate</param>
        /// <param name="lng">Longitude coordinate</param>
        /// <param name="radius">Search radius (currently unused - using distance ranking)</param>
        /// <param name="eventId">Event ID to associate with found places</param>
        /// <param name="fromTime">Start time for the place option</param>
        /// <param name="toTime">End time for the place option</param>
        /// <returns>List of generated place options</returns>
        public async Task<List<GeneratedPlaceOption>> SearchPlacesAsync(
            string type, double lat, double lng, int radius, Guid eventId, DateTime fromTime, DateTime toTime)
        {
            // get API key from configuration
            var apiKey = _config["GoogleApiKey"];

            // build Google Places API URL - using distance ranking
            var url = $"https://maps.googleapis.com/maps/api/place/nearbysearch/json" +
                      $"?location={lat},{lng}" +
                      //$"&radius={radius}" +  // radius means e.g. 2000 = 2km around
                      $"&type={type}" +
                      $"&rankby=distance" +
                      $"&key={apiKey}";
            var response = await _httpClient.GetAsync(url);
            if (!response.IsSuccessStatusCode)
            {
                return new List<GeneratedPlaceOption>();
            }

            // parse JSON response
            var json = await response.Content.ReadAsStringAsync();
            // deserialize API response
            var data = JsonSerializer.Deserialize<GooglePlaceResponse>(json, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
            // convert Google API results to our model(take only first 3) -> might be better to do some better algorithm
            var results = data?.Results?.Take(3)
                .Select(r => new GeneratedPlaceOption
                {
                    Id = Guid.NewGuid(),
                    EventId = eventId,
                    PlaceName = r.Name,
                    Adress = r.Vicinity,
                    Location = r.Geometry.Location,
                    TimeFrom = fromTime,
                    TimeTo = toTime
                })
                .ToList() ?? new();

            return results;
        }
    }
}