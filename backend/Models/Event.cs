namespace backend.Models
{
    public class Event
    {
        public Guid Id { get; set; }
        public required string Title { get; set; }
        public string Description { get; set; } = string.Empty;
        public Guid OwnerId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public List<EventOption> Options { get; set; } = new List<EventOption>();
        public List<EventParticipant> Participants { get; set; } = new();
    }
}