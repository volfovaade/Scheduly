namespace backend.Models
{
    /// <summary>
    /// Join entity representing user participation in events with specific roles.
    /// Implements many-to-many relationship between Users and Events.
    /// </summary>
    public class EventParticipant
    {
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;
        public Guid EventId { get; set; }
        public Event Event { get; set; } = null!;
        public string Role {  get; set; } = EventRoles.Participant; // default
    }
}