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
            var adminName = Environment.GetEnvironmentVariable("ADMIN_NAME") ?? "Admin";
            var adminEmail = Environment.GetEnvironmentVariable("ADMIN_EMAIL") ?? "admin@example.com";
            var adminPassword = Environment.GetEnvironmentVariable("ADMIN_PASSWORD") ?? "admin123";
            var adminRole = await context.Roles.FirstOrDefaultAsync(r => r.Name == Roles.Admin)
                ?? throw new InvalidOperationException("Admin role not found. Roles were not seeded correctly.");


            if (!context.Users.Any(u => u.Name == "Admin"))
            {
                var admin = new User
                {
                    Name = adminName,
                    Email = adminEmail,
                    Role = adminRole,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(adminPassword)
                };

                context.Users.Add(admin);
                await context.SaveChangesAsync();
            }
        }
    }
}

