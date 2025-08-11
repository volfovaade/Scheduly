using backend.Models;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace backend.Services {
    public class GooglePlacesService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _config; 

        public GooglePlacesService (HttpClient httpClient, IConfiguration config)
        {
            _httpClient = httpClient;
            _config = config;
        }
        public async Task<List<GeneratedPlaceOption>> SearchPlacesAsync(
            string type, double lat, double lng, int radius, Guid eventId, DateTime fromTime, DateTime toTime)
        {
            var apiKey = _config["GoogleApiKey"];
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
            var json = await response.Content.ReadAsStringAsync();
            Console.WriteLine($"Google API Response Status: {response.StatusCode}");
            Console.WriteLine($"Google API Response: {json}");

            var data = JsonSerializer.Deserialize<GooglePlaceResponse>(json, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
            Console.WriteLine($"Parsed results count: {data?.Results?.Count ?? 0}");

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