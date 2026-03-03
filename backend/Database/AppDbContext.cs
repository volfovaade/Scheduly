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
        public DbSet<TimeInterval> TimeIntervals { get; set; }
        public DbSet<EventOption> EventOptions { get; set; }
        public DbSet<Vote> Votes { get; set; }
        public DbSet<EventParticipant> EventParticipants { get; set; }
        public DbSet<LocationPreference> LocationPreferences { get; set; }
        public DbSet<TimePreference> TimePreferences { get; set; }
        public DbSet<DayPreference> DayPreferences { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<PasswordResetToken> PasswordResetTokens { get; set; }

        /// <summary>
        /// Configures entity relationships and database schema.
        /// </summary>
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // configure TimeInterval->TimePreference relationship
            modelBuilder.Entity<TimeInterval>()
                .HasOne<TimePreference>()
                .WithMany(p => p.TimeIntervals)
                .HasForeignKey(t => t.TimePreferenceId);

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

            // kaskádové mazání pro TimeIntervals pøi smazání TimePreference
            modelBuilder.Entity<TimeInterval>()
                .HasOne(ti => ti.TimePreference)
                .WithMany(tp => tp.TimeIntervals)
                .HasForeignKey(ti => ti.TimePreferenceId)
                .OnDelete(DeleteBehavior.Cascade);

            // kaskádové mazání pro TimePreferences pøi smazání Event
            modelBuilder.Entity<TimePreference>()
                .HasOne(tp => tp.Event)
                .WithMany()
                .HasForeignKey(tp => tp.EventId)
                .OnDelete(DeleteBehavior.Cascade);

            // comment config
            modelBuilder.Entity<Comment>()
                .HasOne(c => c.Event)
                .WithMany(e => e.Comments)
                .HasForeignKey(c => c.EventId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Comment>()
                .HasOne(c => c.User)
                .WithMany(u => u.Comments)
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<DayPreference>()
               .HasIndex(p => new { p.EventId, p.UserId, p.Date })
               .IsUnique();
        }
    }
}