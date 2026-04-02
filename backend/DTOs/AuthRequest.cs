using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class LoginRequest
    {
        [Required, EmailAddress, StringLength(100)]
        public required string Email { get; set; }
        [Required]
        public required string Password { get; set; }
    }

    public class RegisterRequest
    {
        [Required, EmailAddress, StringLength(100)]
        public required string Email { get; set; }
        [Required, StringLength(50, MinimumLength = 2)]
        public required string Name { get; set; }
        [Required, StringLength(100, MinimumLength = 6)]
        public required string Password { get; set; }
    }
}
