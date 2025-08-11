using Microsoft.AspNetCore.Components.Routing;


// correct nested structure for Google Plaecs API
namespace backend.Models
{
    public class GooglePlaceResponse
    {
        public List<GooglePlaceResult> Results { get; set; } = new();
    }
    public class GooglePlaceResult
    {
        public string Name { get; set; } = "";
        public string Vicinity { get; set; } = "";
        public Geometry Geometry { get; set; } = new();
    }
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