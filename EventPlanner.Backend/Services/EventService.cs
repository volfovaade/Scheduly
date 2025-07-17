using EventPlanner.Backend.Database;
using EventPlanner.Backend.DTOs;
using EventPlanner.Backend.Models;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace EventPlanner.Backend.Services
{
    public interface IEventService
    {
        Task<IEnumerable<Event>> GetAllAsync();
        Task<Event?> GetByIdAsync(Guid id);
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
    }
}