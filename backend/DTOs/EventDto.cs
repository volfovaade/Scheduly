using backend.Models;

namespace backend.DTOs
{
    public class EventDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = null!;
        public string Description { get; set; } = string.Empty;
        public EventMode Mode { get; set; } = EventMode.Fixed;
        public DateTime? TimeRangeFrom { get; set; }
        public DateTime? TimeRangeTo { get; set; }
        public Guid OwnerId { get; set; }
        public DateTime CreatedAt { get; set; }
        public string Code => Id.ToString("N")[..6];
    }
    public class DetailedEventDto : EventDto
    {
        public EventPhase Phase { get; set; }
        public bool CurrentUserIsOrganizer { get; set; }
        public List<EventParticipantDto> Participants { get; set; } = new();
    }
}