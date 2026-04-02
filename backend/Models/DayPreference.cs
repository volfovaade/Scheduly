using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class DayPreference
    {
        public Guid Id { get; set; }

        public Guid EventId { get; set; }
        public Event Event { get; set; } = null!;

        public Guid UserId { get; set; }
        public User User { get; set; } = null!;
        [Required]
        public DateOnly Date { get; set; }
    }
}
