using System.Text.Json.Serialization;

namespace backend.Models
{
    /// <summary>
    /// Response models for Google Places API integration.
    /// These classes match the JSON structure returned by Google Places API.
    /// </summary>

    #region Nearby Search API Models

    /// <summary>
    /// Root response object from Google Places Nearby Search API.
    /// </summary>
    public class GooglePlaceResponse
    {
        public List<GooglePlace> Results { get; set; } = new();
        public string Status { get; set; } = "";
    }

    /// <summary>
    /// Individual place result from Nearby Search API.
    /// </summary>
    public class GooglePlace
    {
        [JsonPropertyName("place_id")]
        public string PlaceId { get; set; } = "";

        public string Name { get; set; } = "";

        public string Vicinity { get; set; } = "";

        public List<string>? Types { get; set; }

        public Geometry Geometry { get; set; } = new();

        public double? Rating { get; set; }

        [JsonPropertyName("price_level")]
        public int? PriceLevel { get; set; }

        [JsonPropertyName("user_ratings_total")]
        public int? UserRatingsTotal { get; set; }
    }

    #endregion

    #region Shared Models

    /// <summary>
    /// Geometry information containing location coordinates.
    /// </summary>
    public class Geometry
    {
        public Location Location { get; set; } = new();
    }

    /// <summary>
    /// Geographic coordinates.
    /// </summary>
    public class Location
    {
        public double Lat { get; set; }
        public double Lng { get; set; }
    }

    #endregion
}