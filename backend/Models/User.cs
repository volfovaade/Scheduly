using System.Data;
namespace backend.Models
{
    public class User
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public required string Email { get; set; }
        public required string PasswordHash { get; set; }
        public Role? Role { get; set; }
        // navigation for many-to-many relations with additional data
        // User <-> Event + Role
        public List<EventParticipant> Events { get; set; } = new();
    }
}
