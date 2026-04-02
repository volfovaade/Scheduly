using System.ComponentModel.DataAnnotations;

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
        [Required]
        public PlaceType Type { get; set; }
        [Range(-90, 90)]
        public double Latitude { get; set; }
        [Range(-180, 180)]
        public double Longitude { get; set; }
        public PriceLevel PreferredPriceLevel { get; set; } = PriceLevel.Any;
        [Range(0, 5)]
        public double MinRating { get; set; } = 0.0;  // 0-5
    }
}