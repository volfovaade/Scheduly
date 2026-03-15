
using backend.Database;
using backend.Models;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class ReminderBackgroundService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        public ReminderBackgroundService(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                await SendRemiders();
                await AutoCloseExpiredEvents();
                await Task.Delay(TimeSpan.FromHours(6), stoppingToken);
            }
        }
        /// <summary>
        /// Sending reminder to organizators for sharing the code, or closing the event.
        /// </summary>
        /// <returns></returns>
        private async Task SendRemiders()
        {
            using var scope = _scopeFactory.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

            // Events with TimeRangeFrom end in 24-30 h and are still in Proposal phase
            var window = DateTimeOffset.UtcNow.AddHours(24);
            var upcoming = await context.Events
                .Include(e => e.Participants)
                .ThenInclude(p => p.User)
                .ThenInclude(u => u.Role)
                .Where(e =>
                    e.Phase == EventPhase.Proposal &&
                    e.TimeRangeFrom.HasValue &&
                    e.TimeRangeFrom.Value >= DateTimeOffset.UtcNow &&
                    e.TimeRangeFrom <= window)
                .ToListAsync();

            foreach (var ev in upcoming)
            {
                foreach (var p in ev.Participants)
                {
                    if (p.User.Role.Name == EventRoles.Organizator)
                    {
                        await emailService.SendDeadlineReminderAsync(
                            p.User.Email, p.User.Name,
                            ev.Title, ev.TimeRangeFrom!.Value);
                    }
                }
            }
        }
        /// <summary>
        /// Automatically closes events where TimeRangeTo has passed and event is still in Proposal phase.
        /// </summary>
        private async Task AutoCloseExpiredEvents()
        {
            using var scope = _scopeFactory.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();
            var eventService = scope.ServiceProvider.GetRequiredService<IEventService>();

            var expiredEvents = await context.Events
                .Include(e => e.Participants)
                .ThenInclude(p => p.User)
                .Where(e =>
                    e.Phase == EventPhase.Proposal && e.TimeRangeFrom.HasValue &&
                    e.TimeRangeFrom.Value <= DateTimeOffset.UtcNow
                )
                .ToListAsync();
            foreach (var ev in expiredEvents)
            {
                try
                {
                    ev.Phase = EventPhase.Closed;
                    await context.SaveChangesAsync();
                    foreach (var p in ev.Participants)
                    {
                        await emailService.SendEventCancelledAsync(
                            p.User.Email, p.User.Name, ev.Title);
                    }
                }
                catch (Exception ex)
                {
                    // log but don't crash the whole loop
                    Console.Error.WriteLine($"Failed to auto-close event {ev.Id}: {ex.Message}");
                }
            }
        }
    }
}