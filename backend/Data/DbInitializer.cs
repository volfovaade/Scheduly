using backend.Models;
using backend.Database;
using Microsoft.EntityFrameworkCore;
namespace backend.Data
{
    /// <summary>
    /// Static class responsible for database initialization and seeding.
    /// Ensures the database schema is up-to-date and contains required initial data.
    /// </summary>
    public static class DbInitializer
    {
        /// <summary>
        /// Initializes the database by running migrations and seeding initial data.
        /// Creates default roles and admin user if they don't exist.
        /// </summary>
        /// <param name="context">Database context to initialize</param>
        public static async Task InitializeAsync(AppDbContext context)
        {
            // apply any pending database migrations
            await context.Database.MigrateAsync();

            // seed default roles if none exist
            if (!context.Roles.Any())  
            {
                context.Roles.AddRange(
                    new Role { Name = Roles.Admin },
                    new Role { Name = Roles.User }
                );
                await context.SaveChangesAsync();
            }

            // create default admin user if it doesn't exist
            // TODO: Move hardcoded credentials to configuration file for security
            // for now hardcoded in the code, later probably should be in some config file as variables !!!!!!!!!!!!!!!!!!!!!
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

