namespace backend.Models
{
    /// <summary>
    /// Static classes defining role constants for the application.
    /// </summary>
    public static class Roles
    {
        // system-wide user roles
        public const string Admin = "Admin";
        public const string User = "User";
    }
    public static class EventRoles
    {
        // event-specific participant roles
        public const string Organizator = "Organizator";
        public const string Participant = "Participant";
    }

    /// <summary>
    /// User role entity for role-based authorization.
    /// </summary>
    public class Role
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = Roles.User; // default to regular user role
    }
}
