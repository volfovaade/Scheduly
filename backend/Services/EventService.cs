using backend.Database;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public interface IEventService
    {
        Task<IEnumerable<Event>> GetAllAsync();
        Task<Event?> GetByIdAsync(Guid id);
        Task<IEnumerable<Event>> GetUserEventsAsync(Guid userId);
        Task<Event> CreateAsync(Guid userId, EventCreateDto dto);
        Task<bool> DeleteAsync(Guid id, Guid userId);
    }
    public class EventService : IEventService
    {
        private readonly AppDbContext _context;
        public EventService(AppDbContext context)
        {
            _context = context;
        }
        public async Task<Event> CreateAsync(Guid userId, EventCreateDto dto)
        {
            var newEvent = new Event
            {
                Id = Guid.NewGuid(),
                Title = dto.Title,
                Description = dto.Description,
                CreatedAt = DateTime.UtcNow,
                OwnerId = userId
            };
            _context.Events.Add(newEvent);
            _context.EventParticipants.Add(new EventParticipant
            {
                UserId = userId,
                EventId = newEvent.Id,
                Role = EventRoles.Organizator
            });
            await _context.SaveChangesAsync();
            return newEvent;
        }

        public async Task<bool> DeleteAsync(Guid eventId, Guid userId)
        {
            var ev = await _context.Events.FindAsync(eventId);
            if (ev == null || userId != ev.OwnerId)
            {
                return false;
            }
            _context.Events.Remove(ev);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<Event>> GetAllAsync()
        {
            var events = await _context.Events.ToListAsync();
            return events;
        }

        public async Task<Event?> GetByIdAsync(Guid eventId)
        {
            var ev = await _context.Events.FirstOrDefaultAsync(e => e.Id == eventId);
            if (ev == null) return null;
            return ev;
        }

        public async Task<IEnumerable<Event>> GetUserEventsAsync(Guid userId)
        {
            var userEvents = await _context.Events
                    .Where(e => e.Participants.Any(p => p.UserId == userId))
                    .ToListAsync();
            return userEvents;
        }
    }
}