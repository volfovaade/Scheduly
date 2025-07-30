namespace backend.DTOs
{
    public class OptionCreateDto
    {
        public required string PlaceName { get; set; }
        public string? Location { get; set; }
        public required DateTime TimeFrom { get; set; }
        public required DateTime TimeTo { get; set; }
    }
}