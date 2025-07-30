using backend.Models;
using backend.Database;
using Microsoft.EntityFrameworkCore;
namespace backend.Data
{
    public static class DbInitializer
    {
        public static async Task InitializeAsync(AppDbContext context)
        {
            await context.Database.MigrateAsync();

            if (!context.Roles.Any())  // create roles
            {
                context.Roles.AddRange(
                    new Role { Name = Roles.Admin },
                    new Role { Name = Roles.User },
                    new Role { Name = EventRoles.Organizator },
                    new Role { Name = EventRoles.Participant }
                );
                await context.SaveChangesAsync();
            }
            /// for now hardcoded in the code, later probably should be in some config file as variables !!!!!!!!!!!!!!!!!!!!!
            if (!context.Users.Any(u => u.Name == "admin"))
            {
                var admin = new User
                {
                    Name = "admin",
                    Email = "admin@example.com",
                    Role = await context.Roles.FirstOrDefaultAsync(r => r.Name == "Admin"),
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123") 
                };

                context.Users.Add(admin);
                await context.SaveChangesAsync();
            }
        }
    }
}

