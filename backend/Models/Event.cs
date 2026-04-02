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

        [Required]
        [StringLength(100, MinimumLength = 3)]
        public required string Title { get; set; }

        [MaxLength(2000)]
        public string Description { get; set; } = string.Empty;

        public Guid OwnerId { get; set; }

        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public EventMode Mode { get; set; } = EventMode.Fixed;
        public bool IsMultiDay { get; set; } = false;

        [Required]
        [StringLength(8, MinimumLength = 4)]
        public string Code { get; set; } = null!;

        public ConstraintType Constraint { get; set; } = ConstraintType.None;

        public DateTimeOffset? TimeRangeFrom { get; set; }
        public DateTimeOffset? TimeRangeTo { get; set; }

        [StringLength(200)]
        public string? FixedPlaceName { get; set; }

        [StringLength(500)]
        public string? FixedAddress { get; set; }

        [Range(-90, 90)]
        public double? FixedLatitude { get; set; }

        [Range(-180, 180)]
        public double? FixedLongitude { get; set; }

        public DateTimeOffset? FixedTimeFrom { get; set; }
        public DateTimeOffset? FixedTimeTo { get; set; }

        public EventPhase Phase { get; set; } = EventPhase.Proposal;

        public bool AllowParticipantOptions { get; set; } = false;

        [Range(1, 20)]
        public int MaxOptionsPerUser { get; set; } = 3;

        [Range(1, 50)]
        public int GeneratedOptionsCount { get; set; } = 3;

        // Navigace a finální výsledky
        public List<EventOption> Options { get; set; } = new List<EventOption>();
        public List<EventParticipant> Participants { get; set; } = new();
        public List<Comment> Comments { get; set; } = new();

        [StringLength(200)]
        public string? FinalPlaceName { get; set; }

        [StringLength(500)]
        public string? FinalAddress { get; set; }

        public DateTimeOffset? FinalTimeFrom { get; set; }
        public DateTimeOffset? FinalTimeTo { get; set; }
    }
}