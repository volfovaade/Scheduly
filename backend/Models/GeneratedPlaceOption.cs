namespace backend.Models
{
    public class GeneratedPlaceOption
    {
        public Guid Id { get; set; }
        public Guid EventId { get; set; }
        public string PlaceName { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty; // address
        public DateTime TimeFrom { get; set; }
        public DateTime TimeTo { get; set; }
    }
}