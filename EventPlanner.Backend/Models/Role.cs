namespace EventPlanner.Backend.Models
{
    public static class Roles
    {
        public const string Admin = "Admin";
        public const string Organizator = "Organizator";  //// organizator role is redundant, no need
        public const string User = "User";                  // in Event we have createdBy id of the user
    }
    public class Role
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = Roles.User;
    }
}
