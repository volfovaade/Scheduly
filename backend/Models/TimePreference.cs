// Models/TimePreference.cs
namespace backend.Models
{
    /// <summary>
    /// User's available time slots for events (without location).
    /// Used for FixedPlaceOpenTime events.
    /// </summary>
    public class TimePreference
    {
        public Guid Id { get; set; }
        public Guid EventId { get; set; }
        public Event Event { get; set; } = null!;
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;

        public List<TimeInterval> TimeIntervals { get; set; } = new();
    }
}