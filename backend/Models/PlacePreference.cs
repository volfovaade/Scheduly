namespace backend.Models
{
    /// <summary>
    /// Types of places users can prefer for events.
    /// </summary>
    public enum PlaceType { Parc, Cafe, Restaurant, Other }

    /// <summary>
    /// Used for open events.
    /// User's preference for event location and timing.
    /// Contains preferred place type, location, and available time slots.
    /// </summary>
    public class PlacePreference
    {
        public Guid Id { get; set; }
        public Guid EventId { get; set; }
        public Event Event { get; set; } = null!;
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;

        public PlaceType Type { get; set; }  // preferred type of place
        public double Latitude { get; set; }
        public double Longitude { get; set; }

        // user's available time slots for this preference
        public List<TimeInterval> TimeIntervals { get; set; } = new();
    }
}