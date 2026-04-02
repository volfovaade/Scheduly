using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class FinalizeWithPlaceDto
    {
        [Range(1, 1440)]
        public int? Duration { get; set; }
        [StringLength(50)]
        public string? OrganizerPlaceTypeChoice { get; set; }
    }
}