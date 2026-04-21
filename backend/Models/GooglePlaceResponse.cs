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

        [JsonPropertyName("opening_hours")]
        public BasicOpeningHours? OpeningHours { get; set; }
    }

    /// <summary>
    /// Basic opening hours info from Nearby Search (only contains open_now).
    /// </summary>
    public class BasicOpeningHours
    {
        [JsonPropertyName("open_now")]
        public bool OpenNow { get; set; }
    }

    #endregion

    #region Place Details API Models

    /// <summary>
    /// Root response object from Google Places Details API.
    /// </summary>
    public class PlaceDetailsResponse
    {
        public PlaceDetails? Result { get; set; }
        public string Status { get; set; } = "";
    }

    /// <summary>
    /// Detailed place information including full opening hours.
    /// </summary>
    public class PlaceDetails
    {
        [JsonPropertyName("place_id")]
        public string PlaceId { get; set; } = "";

        public string Name { get; set; } = "";

        [JsonPropertyName("formatted_address")]
        public string? FormattedAddress { get; set; }

        [JsonPropertyName("business_status")]
        public string? BusinessStatus { get; set; }

        [JsonPropertyName("opening_hours")]
        public DetailedOpeningHours? OpeningHours { get; set; }

        public List<string>? Types { get; set; }

        public double? Rating { get; set; }

        [JsonPropertyName("price_level")]
        public int? PriceLevel { get; set; }
    }

    /// <summary>
    /// Detailed opening hours with periods for each day.
    /// </summary>
    public class DetailedOpeningHours
    {
        [JsonPropertyName("open_now")]
        public bool OpenNow { get; set; }

        public List<Period>? Periods { get; set; }

        [JsonPropertyName("weekday_text")]
        public List<string>? WeekdayText { get; set; }
    }

    /// <summary>
    /// Opening period with open and close times.
    /// </summary>
    public class Period
    {
        public TimeInfo? Open { get; set; }
        public TimeInfo? Close { get; set; }
    }

    /// <summary>
    /// Time information for opening/closing.
    /// </summary>
    public class TimeInfo
    {
        public int Day { get; set; } // 0-6 (Sunday=0, Monday=1, ..., Saturday=6)
        public string Time { get; set; } = ""; // "HHMM" format 
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