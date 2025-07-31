namespace backend.DTOs
{
    public class EventDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = null!;
        public string Description { get; set; } = string.Empty;
        public Guid OwnerId { get; set; }
        public DateTime CreatedAt { get; set; }
        public string Code => Id.ToString("N")[..6];
    }
    public class DetailedEventDto : EventDto
    {
        public List<EventParticipantDto> Participants { get; set; } = new();
    }
}