using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    /// <summary>
    /// Auto-generated place option created by analyzing user preferences.
    /// These options are presented to users for final voting.
    /// </summary>
    public class GeneratedPlaceOption
    {
        public Guid Id { get; set; }
        public Guid EventId { get; set; }
        [Required]
        [StringLength(200)]
        public string PlaceName { get; set; } = string.Empty;
        [StringLength(500)]
        public string Address { get; set; } = string.Empty;
        [Required]
        public Location Location { get; set; } = new(); // GPS coordinates
        [Required]
        public DateTimeOffset TimeFrom { get; set; }
        [Required]
        public DateTimeOffset TimeTo { get; set; }
    }
}