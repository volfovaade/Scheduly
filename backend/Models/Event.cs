using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

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
        Fixed,   // users can add prefrences but just as fixed date+place
        SingleOption,           // Typ 1: Organizátor vytvoøí 1 místo+èas, ostatní se pøihlašují
        CollaborativeOptions,   // Typ 2: Kdokoli mùže pøidávat návrhy míst a èasù
        OrganizerOptions,       // Typ 3: Pouze organizátor pøidává návrhy
        FixedTimeOpenPlace,     // Typ 4: Fixní èas, generování míst z preferencí
        FixedPlaceOpenTime,     // Typ 5: Fixní místo, výbìr prùniku èasù
        FullyOpen              // Typ 6: Otevøené místo i èas, generování obojího

    }
    /// <summary>
    /// Represents the contrains of the event
    /// </summary>
    public enum ConstraintType
    {
        None,        
        TimeRange,      
        FixedPlace,     
        FixedTime,      
        MultiDay        
    }

    /// <summary>
    /// Main event entity representing a planned gathering or meeting.
    /// </summary>
    [Index(nameof(Code), IsUnique = true)]
    public class Event
    {
        public Guid Id { get; set; }
        public required string Title { get; set; }
        public string Description { get; set; } = string.Empty;
        public Guid OwnerId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public EventMode Mode { get; set; } = EventMode.Fixed;
        public bool IsMultiDay { get; set; } = false;
        [Required]
        [MaxLength(8)]
        public string Code { get; set; } = null!;

        // Constraints
        public ConstraintType Constraint { get; set; } = ConstraintType.None;
        public DateTime? TimeRangeFrom { get; set; }
        public DateTime? TimeRangeTo { get; set; }
        public string? FixedPlaceName { get; set; }
        public string? FixedAddress { get; set; }
        public double? FixedLatitude { get; set; }
        public double? FixedLongitude { get; set; }

        public DateTime? FixedTimeFrom { get; set; }
        public DateTime? FixedTimeTo { get; set; }

        public EventPhase Phase { get; set; } = EventPhase.Proposal;

        // Permissions
        public bool AllowParticipantOptions { get; set; } = false;
        public int MaxOptionsPerUser { get; set; } = 3;
        public int GeneratedOptionsCount { get; set; } = 3;

        // Navigation
        public List<EventOption> Options { get; set; } = new List<EventOption>();
        public List<EventParticipant> Participants { get; set; } = new();
        public List<Comment> Comments { get; set; } = new();

        // Final results
        public string? FinalPlaceName { get; set; }
        public string? FinalAddress { get; set; }
        public DateTime? FinalTimeFrom { get; set; }
        public DateTime? FinalTimeTo { get; set; }
    }
}