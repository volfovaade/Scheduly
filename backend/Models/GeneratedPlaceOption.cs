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
        public string Adress { get; set; } = string.Empty; // address
        public Location Location { get; set; } = new(); // GPS coordinates
        public DateTime TimeFrom { get; set; }
        public DateTime TimeTo { get; set; }
    }
}