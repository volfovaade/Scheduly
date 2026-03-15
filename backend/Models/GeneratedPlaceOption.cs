namespace backend.Models
{
    /// <summary>
    /// Auto-generated place option created by analyzing user preferences.
    /// These options are presented to users for final voting.
    /// </summary>
    public class GeneratedPlaceOption
    {
        public Guid Id { get; set; }
        public Guid EventId { get; set; }
        public string PlaceName { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public Location Location { get; set; } = new(); // GPS coordinates
        public DateTimeOffset TimeFrom { get; set; }
        public DateTimeOffset TimeTo { get; set; }
    }
}