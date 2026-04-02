using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class ForgotPasswordDto
    {
        [Required]
        [EmailAddress]
        [StringLength(100)]
        public string Email { get; set; } = "";
    }
}