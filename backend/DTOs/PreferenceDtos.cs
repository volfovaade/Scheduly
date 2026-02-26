using backend.Models;
namespace backend.DTOs
{
    public class LocationPreferenceDto
    {
        public PlaceType Type { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public PriceLevel PreferredPriceLevel { get; set; } = PriceLevel.Any;
        public double MinRating { get; set; } = 0.0;
    }
    public class TimePreferenceDto
    {
        public PlaceType Type { get; set; }
        public List<TimeIntervalDto> TimeIntervals { get; set; } = new();
    }
    public class SubmitTimeDto
    {
        public List<TimeIntervalDto>? TimeIntervals { get; set; } = new();
        public List<DateOnly>? Dates { get; set; } = new();
    }

    public class TimeIntervalDto
    {
        public DateTimeOffset From { get; set; }
        public DateTimeOffset To { get; set; }
    }
}