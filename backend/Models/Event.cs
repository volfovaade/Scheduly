namespace backend.Models
{
    public enum EventPhase
    {
        Proposal,     // collection of proposals and preferences
        FinalVoting,  // final voting
        Closed        
    }
    public enum EventMode
    {
        Open,    // automated place and date selection
        Fixed   // users can add prefrences but just as fixed date+place
    }
    public class Event
    {
        public Guid Id { get; set; }
        public required string Title { get; set; }
        public string Description { get; set; } = string.Empty;
        public Guid OwnerId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public EventMode Mode { get; set; } = EventMode.Fixed;

        // for open mode event
        public DateTime? TimeRangeFrom { get; set; }   
        public DateTime? TimeRangeTo { get; set; } 
        public EventPhase Phase { get; set; } = EventPhase.Proposal;
        public string Code => Id.ToString("N")[..6]; // auto-generated based on GUID, first 6 chars
        public List<EventOption> Options { get; set; } = new List<EventOption>();
        public List<EventParticipant> Participants { get; set; } = new();
    }
}