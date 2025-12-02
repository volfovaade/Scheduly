using backend.Models;
using backend.Database;
using backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories
{
    public class LocationPrefRepository : ILocationPrefRepository
    {
        private readonly AppDbContext _context;
        public LocationPrefRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task AddAsync(LocationPreference pref)
        {
            await _context.LocationPreferences.AddAsync(pref);
            await _context.SaveChangesAsync();
        }
        public async Task<List<LocationPreference>> GetAllAsync(Guid eventId, Guid userId)
        {
            return await _context.LocationPreferences
                .Where(p => p.EventId == eventId && p.UserId == userId)
                .ToListAsync();
        }
        public async Task<LocationPreference?> GetAsync(Guid eventId, Guid userId)
        {
            return await _context.LocationPreferences
                .FirstOrDefaultAsync(p => p.EventId == eventId && p.UserId == userId);
        }
        public async Task DeleteAsync(LocationPreference pref)
        {
            _context.LocationPreferences.Remove(pref);
            await _context.SaveChangesAsync();
        }
    }
}