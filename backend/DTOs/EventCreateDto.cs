using backend.Models;
using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class EventCreateDto
    {
        [Required, StringLength(100, MinimumLength = 3)]
        public required string Title { get; set; }
        [MaxLength(2000)]
        public string Description { get; set; } = string.Empty;
        public EventMode Mode { get; set; } = EventMode.Fixed; // 6 options
        public bool IsMultiDay { get; set; } = false;

        // Constraints
        public ConstraintType Constraint { get; set; } = ConstraintType.None;
        public DateTimeOffset? TimeRangeFrom { get; set; }
        public DateTimeOffset? TimeRangeTo { get; set; }

        // For Fixed place/time modes
        [StringLength(200)]
        public string? FixedPlaceName { get; set; }
        [StringLength(500)]
        public string? FixedAddress { get; set; }
        [Range(-90, 90)]
        public double? FixedLatitude { get; set; }
        [Range(-180, 180)]
        public double? FixedLongitude { get; set; }
        public DateTimeOffset? FixedTimeFrom { get; set; }
        public DateTimeOffset? FixedTimeTo { get; set; }

        // Permissions
        public bool AllowParticipantOptions { get; set; } = false;
        public int MaxOptionsPerUser { get; set; } = 3;
    }
}