namespace backend.Models
{
    public static class Roles
    {
        // system's roles
        public const string Admin = "Admin";
        public const string User = "User";
    }
    public static class EventRoles
    {
        // event's roles
        public const string Organizator = "Organizator";
        public const string Participant = "Participant";
    }
    public class Role
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = Roles.User;
    }
}
