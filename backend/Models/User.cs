using System.ComponentModel.DataAnnotations;
using System.Data;
namespace backend.Models
{
    /// <summary>
    /// Application user entity with authentication and authorization data.
    /// And users comments to events.
    /// </summary>

    public class User
    {
        public Guid Id { get; set; }
        [Required]
        [StringLength(20, MinimumLength = 2)]
        public required string Name { get; set; }
        [Required]
        [EmailAddress]
        [StringLength(50)]
        public required string Email { get; set; }
        [Required]
        public required string PasswordHash { get; set; }   // BCrypt hashed password
        [Required]
        public required Role Role { get; set; }  // user's system role

        /// <summary>
        /// Navigation property for many-to-many relationship with Events.
        /// Contains event participation data with roles.
        /// User - Event + Role
        /// </summary>
        public List<EventParticipant> Events { get; set; } = new();
        public List<Comment> Comments { get; set; } = new();
    }
}
