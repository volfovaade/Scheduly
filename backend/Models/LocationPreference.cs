namespace backend.Models
{
    /// <summary>
    /// Types of places users can prefer for events.
    /// </summary>
    public enum PlaceType { Parc, Cafe, Restaurant, Other }
    /// <summary>
    /// User's preferred location for events (without time preference).
    /// Used for FixedTimeOpenPlace events.
    /// </summary>
    public class LocationPreference
    {
        public Guid Id { get; set; }
        public Guid EventId { get; set; }
        public Event Event { get; set; } = null!;
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;

        public PlaceType Type { get; set; }  // Preferred type of place
        public double Latitude { get; set; }
        public double Longitude { get; set; }
    }
}