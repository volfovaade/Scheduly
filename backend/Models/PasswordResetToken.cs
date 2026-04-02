using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class PasswordResetToken
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;
        [Required]
        [StringLength(256)]
        public string Token { get; set; } = string.Empty;
        [Required]
        public DateTimeOffset ExpiresAt { get; set; }
        public bool Used { get; set; } = false;
    }
}