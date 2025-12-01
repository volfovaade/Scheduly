using backend.Database;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using System.Reflection.Metadata.Ecma335;
using System.Security.Claims;

namespace backend.Services
{
    /// <summary>
    /// Service interface for event management operations.
    /// </summary>
    public interface IEventService
    {
        Task<IEnumerable<EventDto>> GetAllAsync();
        Task<DetailedEventDto?> GetByIdAsync(Guid id, Guid currentUserId);
        Task<IEnumerable<EventDto>> GetUserEventsAsync(Guid userId);
        Task<EventDto> CreateAsync(Guid userId, EventCreateDto dto);
        Task<bool> DeleteAsync(Guid id, Guid userId);
        Task<List<EventOption>> FinalizeFullyOpen(Guid eventId, int durationInHours);
        Task<List<EventOption>> FinalizeFixedTimeOpenPlace(Guid eventId);
        Task<DateTime> FinalizeFixedPlaceOpenTime(Guid eventId);

    }
    /// <summary>
    /// Service for managing events including creation, retrieval, and place recommendation generation.
    /// </summary>
    public class EventService : IEventService
    {
        private readonly AppDbContext _context;
        private readonly GooglePlacesService _googlePlacesService;
        public EventService(AppDbContext context, GooglePlacesService googlePlacesService)
        {
            _context = context;
            _googlePlacesService = googlePlacesService;
        }
        /// <summary>
        /// Creates a new event and adds the creator as organizer.
        /// </summary>
        public async Task<EventDto> CreateAsync(Guid userId, EventCreateDto dto)
        {
            var newEvent = new Event
            {
                Id = Guid.NewGuid(),
                Title = dto.Title,
                Description = dto.Description,
                Mode = dto.Mode,
                IsMultiDay = dto.IsMultiDay,
                Constraint = dto.Constraint,
                TimeRangeFrom = dto.TimeRangeFrom,
                TimeRangeTo = dto.TimeRangeTo,
                FixedPlaceName = dto.FixedPlaceName,
                FixedAddress = dto.FixedAddress,
                FixedLatitude = dto.FixedLatitude,
                FixedLongitude = dto.FixedLongitude,
                FixedTimeFrom = dto.FixedTimeFrom,
                FixedTimeTo = dto.FixedTimeTo,
                AllowParticipantOptions = dto.AllowParticipantOptions,
                MaxOptionsPerUser = dto.MaxOptionsPerUser,
                CreatedAt = DateTime.UtcNow,
                OwnerId = userId
            };
            _context.Events.Add(newEvent);
            // add creator as organizer participant
            _context.EventParticipants.Add(new EventParticipant
            {
                UserId = userId,
                EventId = newEvent.Id,
                Role = EventRoles.Organizator
            });
            await _context.SaveChangesAsync();
            return ToDto(newEvent);
        }
        /// <summary>
        /// Deletes an event if the user is the owner.
        /// </summary>
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
        /// <summary>
        /// Retrieves all events as basic DTOs.
        /// </summary>
        public async Task<IEnumerable<EventDto>> GetAllAsync()
        {
            var events = await _context.Events.Select(e => ToDto(e)).ToListAsync();
            return events;
        }
        /// <summary>
        /// Retrieves detailed event information including participants.
        /// </summary>
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
                IsMultiDay = ev.IsMultiDay,
                Constraint = ev.Constraint,
                TimeRangeFrom = ev.TimeRangeFrom,
                TimeRangeTo = ev.TimeRangeTo,
                FixedPlaceName = ev.FixedPlaceName,
                FixedAddress = ev.FixedAddress,
                FixedTimeFrom = ev.FixedTimeFrom,
                FixedTimeTo = ev.FixedTimeTo,
                OwnerId = ev.OwnerId,
                CreatedAt = ev.CreatedAt,
                Phase = ev.Phase,
                AllowParticipantOptions = ev.AllowParticipantOptions,
                FinalPlaceName = ev.FinalPlaceName,
                FinalAddress = ev.FinalAddress,
                FinalTimeFrom = ev.FinalTimeFrom,
                FinalTimeTo = ev.FinalTimeTo,
                Participants = ev.Participants.Select(ToParticipantDto).ToList(),
                CurrentUserIsOrganizer = ev.Participants.Any(p => p.UserId == currentUserId && p.Role == EventRoles.Organizator),
            };
        }
        /// <summary>
        /// Retrieves all events where the user is a participant.
        /// </summary>
        public async Task<IEnumerable<EventDto>> GetUserEventsAsync(Guid userId)
        {
            var userEvents = await _context.Events
                    .Where(e => e.Participants.Any(p => p.UserId == userId))
                    .Select(e => ToDto(e))
                    .ToListAsync();
            return userEvents;
        }
        /// <summary>
        /// Analyzes user preferences and generates place recommendations using Google Places API.
        /// Determines the most popular place type, optimal location, and best time slot.
        /// </summary>
        /// <param name="eventId">The event's id that is being finalized</param>
        /// <param name="durationInHours"> Organizator sets the duration of the event </param>
    
        public async Task<List<EventOption>> FinalizeFullyOpen(Guid eventId, int durationInHours)
        {
            var ev = await _context.Events.FindAsync(eventId);
            if (ev == null) throw new Exception("Event not found");

            var locationPrefs = await _context.LocationPreferences
                .Where(p => p.EventId == eventId)
                .ToListAsync();

            if (locationPrefs.Count == 0)
                throw new Exception("No location preferences submitted");

            // Most preferred type
            var topType = locationPrefs.GroupBy(p => p.Type)
                .OrderByDescending(g => g.Count())
                .First().Key;

            // Average location
            var avgLat = locationPrefs.Average(p => p.Latitude);
            var avgLng = locationPrefs.Average(p => p.Longitude);

            // get the hour with most availability and center the event duration around it
            var bestDate = await FinalizeFixedPlaceOpenTime(eventId);
            var fromTime = bestDate.AddHours(-durationInHours / 2);
            var toTime = bestDate.AddHours(durationInHours / 2);

            // generate place suggestions using Google Places API
            var generated = await _googlePlacesService
                .SearchPlacesAsync(ConvertPlaceTypeToString(topType), avgLat, avgLng, eventId, fromTime, toTime);

            _context.EventOptions.AddRange(generated);
            await _context.SaveChangesAsync();

            return generated;
        }
        public async Task<List<EventOption>> FinalizeFixedTimeOpenPlace(Guid eventId)
        {
            var ev = await _context.Events.FindAsync(eventId);
            if (ev == null) throw new Exception("Event not found");

            var locationPrefs = await _context.LocationPreferences
                .Where(p => p.EventId == eventId)
                .ToListAsync();

            if (locationPrefs.Count == 0)
                throw new Exception("No location preferences submitted");

            // Most preferred type
            var topType = locationPrefs.GroupBy(p => p.Type)
                .OrderByDescending(g => g.Count())
                .First().Key;

            // Average location
            var avgLat = locationPrefs.Average(p => p.Latitude);
            var avgLng = locationPrefs.Average(p => p.Longitude);

            // Generate places using fixed time
            var generated = await _googlePlacesService.SearchPlacesAsync(
                ConvertPlaceTypeToString(topType),
                avgLat,
                avgLng,
                eventId,
                ev.FixedTimeFrom!.Value,
                ev.FixedTimeTo!.Value
            );

            _context.EventOptions.AddRange(generated);
            await _context.SaveChangesAsync();

            return generated;
        }
        public async Task<DateTime> FinalizeFixedPlaceOpenTime(Guid eventId)
        {
            var timePrefs = await _context.TimePreferences
                .Include(p => p.TimeIntervals)
                .Where(p => p.EventId == eventId)
                .ToListAsync();

            if (timePrefs.Count == 0)
                throw new Exception("No time preferences submitted");

            // Find most overlapping time
            var timeCounts = new Dictionary<DateTime, int>();
            foreach (var pref in timePrefs)
            {
                foreach (var interval in pref.TimeIntervals)
                {
                    for (var t = interval.From; t < interval.To; t = t.AddHours(1))
                    {
                        var key = new DateTime(t.Year, t.Month, t.Day, t.Hour, 0, 0);
                        if (!timeCounts.ContainsKey(key))
                            timeCounts[key] = 0;
                        timeCounts[key]++;
                    }
                }
            }

            var bestTime = timeCounts.OrderByDescending(kvp => kvp.Value).First().Key;
            return bestTime;
        }

        /// <summary>
        /// Converts enum place type to Google Places API string format.
        /// </summary>
        private string ConvertPlaceTypeToString(PlaceType type)
        {
            return type switch
            {
                PlaceType.Cafe => "cafe",
                PlaceType.Restaurant => "restaurant",
                PlaceType.Parc => "park",
                _ => "other"
            };
        }

        /// <summary>
        /// Converts Event entity to DTO, preventing circular references.
        /// </summary>
        private static EventDto ToDto(Event e) => new EventDto
        {
            Id = e.Id,
            Title = e.Title,
            Description = e.Description,
            Mode = e.Mode,
            IsMultiDay = e.IsMultiDay,
            Constraint = e.Constraint,
            TimeRangeFrom = e.TimeRangeFrom,
            TimeRangeTo = e.TimeRangeTo,
            FixedPlaceName = e.FixedPlaceName,
            FixedAddress = e.FixedAddress,
            FixedTimeFrom = e.FixedTimeFrom,
            FixedTimeTo = e.FixedTimeTo,
            CreatedAt = e.CreatedAt,
            OwnerId = e.OwnerId
        };
        /// <summary>
        /// Converts User entity to DTO.
        /// </summary>
        private static UserDto ToUserDto(User user) => new UserDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role?.Name ?? Roles.User
        };
        /// <summary>
        /// Converts EventParticipant entity to DTO.
        /// </summary>
        private static EventParticipantDto ToParticipantDto(EventParticipant participant) => new EventParticipantDto
        {
            UserId = participant.UserId,
            Role = participant.Role,
            User = ToUserDto(participant.User)
        };
    }
}