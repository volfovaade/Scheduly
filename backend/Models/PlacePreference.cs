namespace backend.Models
{
    public enum PlaceType { Parc, Cafe, Restaurant, Other }
    public class PlacePreference
    {
        public Guid Id { get; set; }
        public Guid EventId { get; set; }
        public Event Event { get; set; } = null!;
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;

        public PlaceType Type { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }

        public List<TimeInterval> TimeIntervals { get; set; } = new();
    }
}