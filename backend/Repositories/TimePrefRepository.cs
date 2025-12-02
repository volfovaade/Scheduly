using backend.Models;
using backend.Database;
using backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories
{
    public class TimePrefRepository : ITimePrefRepository
    {
        private readonly AppDbContext _context;
        public TimePrefRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task AddAsync(TimePreference pref)
        {
            await _context.TimePreferences.AddAsync(pref);
            await _context.SaveChangesAsync();
        }
        public async Task<List<TimePreference>> GetAllAsync(Guid eventId, Guid userId)
        {
            return await _context.TimePreferences
                .Where(p => p.EventId == eventId && p.UserId == userId)
                .ToListAsync();
        }
        public async Task<TimePreference?> GetWithIntervalsAsync(Guid eventId, Guid userId)
        {
            return await _context.TimePreferences
                .Include(p => p.TimeIntervals)
                .FirstOrDefaultAsync(p => p.EventId == eventId && p.UserId == userId);
        }
        public async Task DeleteWithIntervalsAsync(TimePreference pref)
        {
            _context.TimeIntervals.RemoveRange(pref.TimeIntervals);
            _context.TimePreferences.Remove(pref);
            await _context.SaveChangesAsync();
        }
    }
}