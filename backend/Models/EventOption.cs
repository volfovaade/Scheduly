namespace backend.Models
{
    /// <summary>
    /// Represents a specific place and time option for an event.
    /// Users can vote on these options during the voting phase.
    /// </summary>
    public class EventOption
    {
        public Guid Id { get; set; }
        public Guid EventId { get; set; }
        public required string PlaceName { get; set; }
        public string? Location { get; set; }
        public required DateTime TimeFrom { get; set; }
        public required DateTime TimeTo { get; set; }
        public ICollection<Vote> Votes { get; set; } = new List<Vote>();
    }
}
