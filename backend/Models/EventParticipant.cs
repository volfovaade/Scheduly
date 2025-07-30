namespace backend.Models
{
    public class EventParticipant
    {
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;
        public Guid EventId { get; set; }
        public Event Event { get; set; } = null!;
        public string Role {  get; set; } = EventRoles.Participant;
    }
}