using backend.Database;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public interface IEventService
    {
        Task<IEnumerable<EventDto>> GetAllAsync();
        Task<DetailedEventDto?> GetByIdAsync(Guid id);
        Task<IEnumerable<EventDto>> GetUserEventsAsync(Guid userId);
        Task<EventDto> CreateAsync(Guid userId, EventCreateDto dto);
        Task<bool> DeleteAsync(Guid id, Guid userId);
    }
    public class EventService : IEventService
    {
        private readonly AppDbContext _context;
        public EventService(AppDbContext context)
        {
            _context = context;
        }
        public async Task<EventDto> CreateAsync(Guid userId, EventCreateDto dto)
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
            return ToDto(newEvent);
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

        public async Task<IEnumerable<EventDto>> GetAllAsync()
        {
            var events = await _context.Events.Select(e => ToDto(e)).ToListAsync();
            return events;
        }

        public async Task<DetailedEventDto?> GetByIdAsync(Guid eventId)
        {
            var ev = await _context.Events
                .Include(e => e.Participants).ThenInclude(p => p.User)
                .FirstOrDefaultAsync(e => e.Id == eventId);

            if (ev == null) return null;
            return new DetailedEventDto
            {
                Id = ev.Id,
                Title = ev.Title,
                Description = ev.Description,
                OwnerId = ev.OwnerId,
                CreatedAt = ev.CreatedAt,
                Participants = ev.Participants.Select(ToParticipantDto).ToList()
            };
        }

        public async Task<IEnumerable<EventDto>> GetUserEventsAsync(Guid userId)
        {
            var userEvents = await _context.Events
                    .Where(e => e.Participants.Any(p => p.UserId == userId))
                    .Select(e => ToDto(e))
                    .ToListAsync();
            return userEvents;
        }

        // safely transfer event data without circular reference 
        private static EventDto ToDto(Event e) => new EventDto
        {
            Id = e.Id,
            Title = e.Title,
            Description = e.Description,
            CreatedAt = e.CreatedAt,
            OwnerId = e.OwnerId
        };
        private static UserDto ToUserDto(User user) => new UserDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email
        };

        private static EventParticipantDto ToParticipantDto(EventParticipant participant) => new EventParticipantDto
        {
            UserId = participant.UserId,
            Role = participant.Role,
            User = ToUserDto(participant.User)
        };
    }
}