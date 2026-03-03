using backend.Database;
using backend.DTOs;
using backend.Models;
using backend.Persistence.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace backend.Persistence.Repositories
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
        public async Task<List<DayPreference>> GetAllDayVotes(Guid eventId)
        {
            return await _context.DayPreferences.Where(x => x.EventId == eventId).ToListAsync();
        }
        public async Task<List<DateOnly>> GetDates(Guid eventId, Guid userId)
        {
            return await _context.DayPreferences
                .Where(p => p.EventId == eventId && p.UserId == userId)
                .Select(x => x.Date)
                .ToListAsync();
        }
        public async Task RemoveOldVotes(Guid eventId, Guid userId)
        {
            var oldVotes = _context.DayPreferences
                    .Where(x => x.EventId == eventId && x.UserId == userId);

            _context.DayPreferences.RemoveRange(oldVotes);
            await _context.SaveChangesAsync();
        }
        public async Task AddDayPreference(Guid eventId, Guid userId, DateOnly date)
        {
            await _context.DayPreferences.AddAsync(new DayPreference
            {
                Id = Guid.NewGuid(),
                EventId = eventId,
                UserId = userId,
                Date = date
            });
            await _context.SaveChangesAsync();
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