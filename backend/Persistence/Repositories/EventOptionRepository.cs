using backend.Database;
using backend.DTOs;
using backend.Models;
using backend.Persistence.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace backend.Persistence.Repositories
{
    public class EventOptionRepository : IEventOptionRepository
    {
        private readonly AppDbContext _context;
        public EventOptionRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<EventOption>> GetOptionsAsync(Guid eventId)
        {
            return await _context.EventOptions
                .Where(o => o.EventId == eventId)
                .ToListAsync();
        }
        public async Task<bool> HasEventOption(Guid eventId, Guid optionId)
        {
            return await _context.EventOptions
                    .AnyAsync(o => o.Id == optionId && o.EventId == eventId);
        }
        public async Task AddOptionsAsync(List<EventOption> options)
        {
            await _context.EventOptions.AddRangeAsync(options);
            await _context.SaveChangesAsync();
        }
        public async Task AddOptionAsync(EventOption option)
        {
            await _context.EventOptions.AddAsync(option);
            await _context.SaveChangesAsync();
        }
        public async Task<EventOption?> GetOptionWithVotesAsync(Guid eventId, Guid optionId)
        {
            return await _context.EventOptions
                .Include(o => o.Votes)
                .FirstOrDefaultAsync(o => o.Id == optionId && o.EventId == eventId);
        }
        public async Task DeleteAsync(EventOption option)
        {
            _context.EventOptions.Remove(option);
            await _context.SaveChangesAsync();
        }
        public async Task UpdateAsync(EventOption option)
        {
            _context.EventOptions.Update(option);
            await _context.SaveChangesAsync();
        }
    }
}