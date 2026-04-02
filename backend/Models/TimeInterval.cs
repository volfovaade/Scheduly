using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    /// <summary>
    /// Time slot when a user is available for an event.
    /// Part of a user's place preference.
    /// </summary>
    public class TimeInterval
    {
        public Guid Id { get; set; }

        // key to TimePreference
        [Required]
        public Guid TimePreferenceId { get; set; }
        public TimePreference TimePreference { get; set; } = null!;
        [Required]
        public DateTimeOffset From { get; set; }
        [Required]
        public DateTimeOffset To { get; set; }
    }
}