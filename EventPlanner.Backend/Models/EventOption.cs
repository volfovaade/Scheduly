namespace EventPlanner.Backend.Models
{
    public class EventOption
    {
        public Guid Id { get; set; }
        public Guid EventId { get; set; }
        public string PlaceName { get; set; }
        public string Location { get; set; }
        public DateTime TimeFrom { get; set; }
        public DateTime TimeTo { get; set; }
    }
}
