using backend.Models;

namespace backend.DTOs
{
        public class EventCreateDto
        {
            public required string Title { get; set; }
            public string Description { get; set; } = string.Empty;
            public EventMode Mode { get; set; } = EventMode.Fixed; // 6 options
            public bool IsMultiDay { get; set; } = false;

            // Constraints
            public ConstraintType Constraint { get; set; } = ConstraintType.None;
            public DateTime? TimeRangeFrom { get; set; }
            public DateTime? TimeRangeTo { get; set; }

            // For Fixed place/time modes
            public string? FixedPlaceName { get; set; }
            public string? FixedAddress { get; set; }
            public double? FixedLatitude { get; set; }
            public double? FixedLongitude { get; set; }
            public DateTime? FixedTimeFrom { get; set; }
            public DateTime? FixedTimeTo { get; set; }

            // Permissions
            public bool AllowParticipantOptions { get; set; } = false;
            public int MaxOptionsPerUser { get; set; } = 3;
        }
}