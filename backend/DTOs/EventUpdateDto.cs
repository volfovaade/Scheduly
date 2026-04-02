using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class EventUpdateDto
    {
        [StringLength(2000,MinimumLength = 1)]
        public string? Description { get; set; }
    }
}