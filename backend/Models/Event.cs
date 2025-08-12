namespace backend.Models
{
    /// <summary>
    /// Represents the current phase of an event workflow.
    /// </summary>
    public enum EventPhase
    {
        Proposal,     // collection of proposals and preferences
        FinalVoting,  // final voting
        Closed        
    }
    /// <summary>
    /// Defines how the event handles place and time selection.
    /// The users voting restrictions.
    /// </summary>
    public enum EventMode
    {
        Open,    // automated place and date selection
        Fixed   // users can add prefrences but just as fixed date+place
    }

    /// <summary>
    /// Main event entity representing a planned gathering or meeting.
    /// </summary>
    public class Event
    {
        public Guid Id { get; set; }
        public required string Title { get; set; }
        public string Description { get; set; } = string.Empty;
        public Guid OwnerId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public EventMode Mode { get; set; } = EventMode.Fixed;

        // time range for open mode events
        public DateTime? TimeRangeFrom { get; set; }   
        public DateTime? TimeRangeTo { get; set; } 
        public EventPhase Phase { get; set; } = EventPhase.Proposal;

        /// <summary>
        /// Short 6-character code for easy event sharing (first 6 chars of GUID).
        /// </summary>
        public string Code => Id.ToString("N")[..6]; // auto-generated based on GUID, first 6 chars
        public List<EventOption> Options { get; set; } = new List<EventOption>();
        public List<EventParticipant> Participants { get; set; } = new();

        // final selected results after voting
        public string? FinalPlaceName { get; set; }
        public string? FinalAddress { get; set; }
        public DateTime? FinalTimeFrom { get; set; }
        public DateTime? FinalTimeTo { get; set; }
    }
}