    namespace backend.DTOs
    {
        public class EventCreateDto
        {
            public required string Title { get; set; }
            public string Description { get; set; } = string.Empty;
        }
    }