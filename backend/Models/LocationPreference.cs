namespace backend.Models
{
    /// <summary>
    /// Types of places users can prefer for events.
    /// </summary>
    public enum PlaceType
    {
        Cafe,
        Restaurant,
        Bar,
        Hotel,
        Camping,
        Parc,
        Museum,
        Cinema,
        ShoppingMall,
        SportsCenter
    }
    /// <summary>
    /// User's preference for pricing in the event chosen type location
    /// </summary>
    public enum PriceLevel { Any = 0, Budget = 1, Moderate = 2, Upscale = 3, Luxury = 4 }

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
        public PlaceType Type { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public PriceLevel PreferredPriceLevel { get; set; } = PriceLevel.Any;
        public double MinRating { get; set; } = 0.0;  // 0-5
    }
}