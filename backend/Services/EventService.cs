using backend.Database;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using System.Reflection.Metadata.Ecma335;
using System.Security.Claims;

namespace backend.Services
{
    public interface IEventService
    {
        Task<IEnumerable<EventDto>> GetAllAsync();
        Task<DetailedEventDto?> GetByIdAsync(Guid id, Guid currentUserId);
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
                Mode = dto.Mode,
                TimeRangeFrom = dto.TimeRangeFrom,
                TimeRangeTo = dto.TimeRangeTo,
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

        public async Task<DetailedEventDto?> GetByIdAsync(Guid eventId, Guid currentUserId)
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
                Mode = ev.Mode,
                TimeRangeFrom = ev.TimeRangeFrom,
                TimeRangeTo = ev.TimeRangeTo,
                OwnerId = ev.OwnerId,
                CreatedAt = ev.CreatedAt,
                Phase = ev.Phase,
                Participants = ev.Participants.Select(ToParticipantDto).ToList(),
                CurrentUserIsOrganizer = ev.Participants.Any(p => p.UserId == currentUserId && p.Role == EventRoles.Organizator),
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

        public async Task<List<GeneratedPlaceOption>> FinalizeProposalPhase(Guid eventId)
        {     
            var preferences = await _context.PlacePreferences
                .Include(p => p.TimeIntervals)
                .Where(p => p.EventId == eventId).ToListAsync();

            // most preffered type of place
            var topType = preferences.GroupBy(p => p.Type)
                .OrderByDescending(g => g.Count())
                .FirstOrDefault()?.Key;

            // most convenient time
            var timeCounts = new Dictionary<DateTime, int>();
            foreach (var pref in preferences)
            {
                foreach (var interval in pref.TimeIntervals)
                {
                    for (var t = interval.From; t < interval.To; t = t.AddHours(1))
                    {
                        var key = new DateTime(t.Year, t.Month, t.Day, t.Hour, 0, 0);
                        if (!timeCounts.ContainsKey(key))
                        {
                            timeCounts[key] = 0;
                        }
                        timeCounts[key]++;
                    }
                }
            }
            var bestDate = timeCounts.OrderByDescending(kvp => kvp.Value).First().Key;
             
            // generate 3 places... TO DO: using Google Places API... GooglePlacesService
            var generated = Enumerable.Range(1, 3).Select(i => new GeneratedPlaceOption
            {
                Id = Guid.NewGuid(),
                PlaceName = $"Option {i} - {topType}",
                Location = "Auto-generated",
                TimeFrom = bestDate,
                TimeTo = bestDate.AddHours(2)
            }).ToList();
            _context.GeneratedPlaceOptions.AddRange(generated);
            await _context.SaveChangesAsync();

            return generated;
        }

        // safely transfer event data without circular reference 
        private static EventDto ToDto(Event e) => new EventDto
        {
            Id = e.Id,
            Title = e.Title,
            Description = e.Description,
            Mode = e.Mode,
            TimeRangeFrom = e.TimeRangeFrom,
            TimeRangeTo = e.TimeRangeTo,
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