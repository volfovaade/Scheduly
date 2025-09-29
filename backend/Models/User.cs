using System.Data;
namespace backend.Models
{
    /// <summary>
    /// Application user entity with authentication and authorization data.
    /// </summary>

    public class User
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public required string Email { get; set; }
        public required string PasswordHash { get; set; }   // BCrypt hashed password
        public required Role Role { get; set; }  // user's system role

        /// <summary>
        /// Navigation property for many-to-many relationship with Events.
        /// Contains event participation data with roles.
        /// User - Event + Role
        /// </summary>
        public List<EventParticipant> Events { get; set; } = new();
    }
}
