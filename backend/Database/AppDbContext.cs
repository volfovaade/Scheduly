using Microsoft.EntityFrameworkCore;
using backend.Models;
using System.Collections.Generic;

namespace backend.Database
{
    /// <summary>
    /// Entity Framework database context for the application.
    /// Manages all database entities and their relationships.
    /// </summary>
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // Database tables/entities
        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Event> Events { get; set; }
        public DbSet<PlacePreference> PlacePreferences { get; set; }
        public DbSet<TimeInterval> TimeIntervals { get; set; }
        public DbSet<EventOption> EventOptions { get; set; }
        public DbSet<Vote> Votes { get; set; }
        public DbSet<EventParticipant> EventParticipants { get; set; }
        public DbSet<GeneratedPlaceOption> GeneratedPlaceOptions { get; set; }
        public DbSet<FinalVote> FinalVotes { get; set; }

        /// <summary>
        /// Configures entity relationships and database schema.
        /// </summary>
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // configure TimeInterval->PlacePreference relationship
            modelBuilder.Entity<TimeInterval>()
                .HasOne<PlacePreference>()
                .WithMany(p => p.TimeIntervals)
                .HasForeignKey(t => t.PlacePreferenceId);

            // configure EventParticipant with composite primary key (UserId + EventId)
            modelBuilder.Entity<EventParticipant>()
                .HasKey(ep => new { ep.UserId, ep.EventId });

            // relationship between EventParticipant <-> User
            modelBuilder.Entity<EventParticipant>()
                .HasOne(ep => ep.User)
                .WithMany(u => u.Events)
                .HasForeignKey(ep => ep.UserId);

            // relationship between EventParticipant <-> Event
            modelBuilder.Entity<EventParticipant>()
                .HasOne(ep => ep.Event)
                .WithMany(e => e.Participants)
                .HasForeignKey(ep => ep.EventId);

            // configure Location as owned type (embedded in GeneratedPlaceOption table)
            modelBuilder.Entity<GeneratedPlaceOption>()
                .OwnsOne(g => g.Location);

            // ensure all DateTime properties are stored and retrieved as UTC
            // conversion for timestamp, dates should have specified type 
            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                foreach (var property in entityType.GetProperties())
                {
                    if (property.ClrType == typeof(DateTime))
                    {
                        modelBuilder.Entity(entityType.ClrType)
                            .Property<DateTime>(property.Name)
                            .HasConversion(
                                v => v.ToUniversalTime(),
                                v => DateTime.SpecifyKind(v, DateTimeKind.Utc));
                    }
                    // handle nullable DateTime
                    else if (property.ClrType == typeof(DateTime?))
                    {
                        modelBuilder.Entity(entityType.ClrType)
                            .Property<DateTime?>(property.Name)
                            .HasConversion(
                                v => v.HasValue ? v.Value.ToUniversalTime() : v,
                                v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : v);
                    }
                }
            }
            base.OnModelCreating(modelBuilder);
        }
    }
}