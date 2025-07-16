using EventPlanner.Backend.Models;
using EventPlanner.Backend.Database;
namespace EventPlanner.Backend.Data
{
    public static class DbInitializer
    {
        public static async Task InitializeAsync(AppDbContext context)
        {
            // if roles exists, we do not create seed
            if (context.Roles.Any())
                return;

            var roles = new List<Role>
        {
            new Role { Id = Guid.NewGuid(), Name = "Admin" },
            new Role { Id = Guid.NewGuid(), Name = "Organizator" },  // event organizator
            new Role { Id = Guid.NewGuid(), Name = "User" }
        };

            context.Roles.AddRange(roles);
            await context.SaveChangesAsync();
        }
    }
}

