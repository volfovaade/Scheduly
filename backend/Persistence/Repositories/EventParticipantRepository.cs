using backend.Models;
using backend.Database;
using backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Persistence.Repositories
{
    public class EventParticipantRepository : IEventParticipantRepository
    {
        private readonly AppDbContext _context;
        public EventParticipantRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddEventParticipantAsync(EventParticipant participant)
        {
            await _context.EventParticipants.AddAsync(participant);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteEventParticipantAsync(EventParticipant participant)
        {
            _context.EventParticipants.Remove(participant);
            await _context.SaveChangesAsync();
        }
        public async Task<List<EventParticipant>> GetEventParticipantsWithUsername(Guid eventId)
        {
            return await _context.EventParticipants
                .Include(p => p.User)
                .Where(p => p.EventId == eventId)
                .ToListAsync();
        }
        public async Task<EventParticipant?> GetParticipantAsync(Guid eventId, Guid userId)
        {
            return await _context.EventParticipants
                .FirstOrDefaultAsync(p => p.UserId == userId && p.EventId == eventId);
        }
    }
}