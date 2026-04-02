using backend.Models;
using System.ComponentModel.DataAnnotations;
namespace backend.DTOs
{
    public class LocationPreferenceDto
    {
        [Required]
        public PlaceType Type { get; set; }
        [Required]
        [Range(-90, 90)]
        public double Latitude { get; set; }
        [Required]
        [Range(-180, 180)]
        public double Longitude { get; set; }
        public PriceLevel PreferredPriceLevel { get; set; } = PriceLevel.Any;
        [Range(0, 5)]
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