using Microsoft.AspNetCore.Components.Routing;


// correct nested structure for Google Plaecs API
namespace backend.Models
{
    /// <summary>
    /// Response models for Google Places API integration.
    /// These classes match the JSON structure returned by Google Places API.
    /// </summary>

    /// <summary>
    /// Root response object from Google Places API.
    /// </summary>
    public class GooglePlaceResponse
    {
        public List<GooglePlaceResult> Results { get; set; } = new();
    }
    /// <summary>
    /// Individual place result from Google Places API.
    /// </summary>
    public class GooglePlaceResult
    {
        public string Name { get; set; } = "";
        public string Vicinity { get; set; } = "";
        public Geometry Geometry { get; set; } = new();
        public double Rating { get; set; }
        public int? Price_Level { get; set; }
        public int User_Ratings_Total { get; set; }
        public OpeningHours? Opening_Hours { get; set; }
    }
    public class OpeningHours
    {
        public bool Open_Now { get; set; }
    }
    /// <summary>
    /// Geometry information containing location coordinates.
    /// </summary>
    public class Geometry
    {
        public Location Location { get; set; } = new();
    }
    public class Location
    {
        public double Lat {  get; set; }
        public double Lng {  get; set; }
    }
}