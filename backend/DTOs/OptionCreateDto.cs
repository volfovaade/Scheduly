namespace backend.DTOs
{
    public class OptionCreateDto
    {
        public required string PlaceName { get; set; }
        public string? Address { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public required DateTime TimeFrom { get; set; }
        public required DateTime TimeTo { get; set; }
    }
}