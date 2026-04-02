using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class OptionCreateDto
    {
        [Required]
        [StringLength(200, MinimumLength = 2)]
        public required string PlaceName { get; set; }
        [StringLength(500)]
        public string? Address { get; set; }
        [Range(-90, 90)]
        public double? Latitude { get; set; }
        [Range(-180, 180)]
        public double? Longitude { get; set; }
        [Required]
        public required DateTimeOffset TimeFrom { get; set; }
        [Required]
        public required DateTimeOffset TimeTo { get; set; }
    }
}