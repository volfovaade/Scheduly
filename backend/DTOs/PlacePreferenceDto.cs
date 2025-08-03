using backend.Models;
namespace backend.DTOs
{
    public class PlacePreferenceDto
    {
        public PlaceType Type { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }

        public List<TimeIntervalDto> TimeIntervals { get; set; } = new();
    }

    public class TimeIntervalDto
    {
        public DateTime From { get; set; }
        public DateTime To { get; set; }
    }
}