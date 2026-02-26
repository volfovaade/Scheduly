namespace backend.Models
{
    public class DayPreference
    {
        public Guid Id { get; set; }

        public Guid EventId { get; set; }
        public Event Event { get; set; } = null!;

        public Guid UserId { get; set; }
        public User User { get; set; } = null!;

        public DateOnly Date { get; set; }
    }
}
