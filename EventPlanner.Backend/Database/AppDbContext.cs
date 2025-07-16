using Microsoft.EntityFrameworkCore;
using EventPlanner.Backend.Models;
using System.Collections.Generic;

namespace EventPlanner.Backend.Database
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Event> Events { get; set; }
        public DbSet<EventOption> EventOptions { get; set; }
        public DbSet<Vote> Votes { get; set; }
    }
}