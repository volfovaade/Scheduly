using backend.Models;
using backend.Database;
using backend.Persistence.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Persistence.Repositories
{
    public class EventRepository : IEventRepository
    {
        private readonly AppDbContext _context;
        public EventRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Event entity)
        {
            await _context.Events.AddAsync(entity);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Event entity)
        {
            _context.Events.Remove(entity);
            await _context.SaveChangesAsync();
        }
        public async Task DeleteAsync(List<Event> entities)
        {
            _context.Events.RemoveRange(entities);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<Event>> GetAllAsync()
        {
            return await _context.Events.ToListAsync();
        }

        public async Task<Event?> GetByIdAsync(Guid id)
        {
            return await _context.Events.FindAsync(id);
        }
        public async Task<List<Event>> GetByOwnerIdAsync(Guid ownerId)
        {
            return await _context.Events
                .Where(e => e.OwnerId == ownerId)
                .ToListAsync();
        }

        public async Task<Event?> GetByIdWithParticipantsAsync(Guid id)
        {
            return await _context.Events
                .Include(e => e.Participants)
                .ThenInclude(p => p.User)
                .FirstOrDefaultAsync(e => e.Id == id);
        }

        public async Task<List<LocationPreference>> GetLocationPreferencesAsync(Guid eventId)
        {
            return await _context.LocationPreferences
                .Where(p => p.EventId == eventId)
                .ToListAsync();
        }

        public async Task<List<TimePreference>> GetTimePreferencesAsync(Guid eventId)
        {
            return await _context.TimePreferences
                .Where(p => p.EventId == eventId)
                .ToListAsync();
        }
        public async Task<List<TimePreference>> GetTimePreferencesWithIntervalsAsync(Guid eventId)
        {
            return await _context.TimePreferences
                .Include(p => p.TimeIntervals)
                .Where(p => p.EventId == eventId)
                .ToListAsync();
        }
        public async Task<List<Event>> GetByUserParticipation(Guid userId)
        {
            return await _context.Events
                .Include(e => e.Participants)
                .Where(e => e.Participants.Any(p => p.UserId == userId))
                .ToListAsync();
        }
        public async Task<List<Event>> GetOldEventsAsync(DateTimeOffset oldDate)
        {
            return await _context.Events
                    .Where(e => e.CreatedAt < oldDate)
                    .ToListAsync();
        }
        public async Task UpdateAsync(Event e)
        {
            _context.Events.Update(e);
            await _context.SaveChangesAsync();
        }
        public async Task<bool> HasCodeAsync(string code)
        {
            return await _context.Events.AnyAsync(e => e.Code == code);
        }
        public async Task<Event?> GetByCodeAsync(string code)
        {
            return await _context.Events
                .FirstOrDefaultAsync(e => e.Code == code);
        }
    }
}