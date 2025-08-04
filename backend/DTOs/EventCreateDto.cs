using backend.Models;

namespace backend.DTOs
{
        public class EventCreateDto
        {
            public required string Title { get; set; }
            public string Description { get; set; } = string.Empty;
            public EventMode Mode { get; set; } = EventMode.Fixed;
            // for open mode
            public DateTime? TimeRangeFrom { get; set; }
            public DateTime? TimeRangeTo { get; set; }
        }
}