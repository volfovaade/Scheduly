using backend.Models;
using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class EventDto
    {
        public Guid Id { get; set; }
        [StringLength(100)]
        public string Title { get; set; } = null!;
        [StringLength(2000)]
        public string Description { get; set; } = string.Empty;
        public EventMode Mode { get; set; } = EventMode.Fixed;
        public bool IsMultiDay { get; set; }
        [StringLength(8)]
        public string Code { get; set; } = null!;
        public ConstraintType Constraint { get; set; }

        public DateTimeOffset? TimeRangeFrom { get; set; }
        public DateTimeOffset? TimeRangeTo { get; set; }

        public string? FixedPlaceName { get; set; }
        public string? FixedAddress { get; set; }

        public DateTimeOffset? FixedTimeFrom { get; set; }
        public DateTimeOffset? FixedTimeTo { get; set; }

        public Guid OwnerId { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
    }
    public class DetailedEventDto : EventDto
    {
        public EventPhase Phase { get; set; }
        public bool CurrentUserIsOrganizer { get; set; }
        public bool AllowParticipantOptions { get; set; }
        public List<EventParticipantDto> Participants { get; set; } = new();
        public string? FinalPlaceName { get; set; }
        public string? FinalAddress { get; set; }
        public DateTimeOffset? FinalTimeFrom { get; set; }
        public DateTimeOffset? FinalTimeTo { get; set; }
        public string? CancelledReason { get; set; }
    }
}