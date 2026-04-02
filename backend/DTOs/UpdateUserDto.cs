using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class UpdateUserDto
    {
        [StringLength(20, MinimumLength = 2)]
        public string? Name { get; set; }
        [EmailAddress]
        [StringLength(100)]
        public string? Email { get; set; }
        public string? CurrentPassword { get; set; }
        [StringLength(100, MinimumLength = 6)]
        public string? NewPassword { get; set; }
    }
}