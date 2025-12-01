using backend.Models;

namespace backend.DTOs
{
    public class EventDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = null!;
        public string Description { get; set; } = string.Empty;
        public EventMode Mode { get; set; } = EventMode.Fixed;
        public bool IsMultiDay { get; set; }
        public ConstraintType Constraint { get; set; }

        public DateTime? TimeRangeFrom { get; set; }
        public DateTime? TimeRangeTo { get; set; }

        public string? FixedPlaceName { get; set; }
        public string? FixedAddress { get; set; }

        public DateTime? FixedTimeFrom { get; set; }
        public DateTime? FixedTimeTo { get; set; }

        public Guid OwnerId { get; set; }
        public DateTime CreatedAt { get; set; }
        public string Code => Id.ToString("N")[..6];
    }
    public class DetailedEventDto : EventDto
    {
        public EventPhase Phase { get; set; }
        public bool CurrentUserIsOrganizer { get; set; }
        public bool AllowParticipantOptions { get; set; }
        public List<EventParticipantDto> Participants { get; set; } = new();
        public string? FinalPlaceName { get; set; }
        public string? FinalAddress { get; set; }
        public DateTime? FinalTimeFrom { get; set; }
        public DateTime? FinalTimeTo { get; set; }
    }
}