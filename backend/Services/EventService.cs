using backend.Database;
using backend.DTOs;
using backend.Models;
using backend.Repositories.Interfaces;
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
        Task<List<EventOption>> FinalizeFullyOpen(Guid eventId, int? duration = 2, string? organizerTypeChoice = null);
        Task<List<EventOption>> FinalizeFixedTimeOpenPlace(Guid eventId, string? organizerTypeChoice = null);
        Task<DateTimeOffset> FinalizeFixedPlaceOpenTime(Event ev, int duration);

    }
    /// <summary>
    /// Service for managing events including creation, retrieval, and place recommendation generation.
    /// </summary>
    public class EventService : IEventService
    {
        private readonly IEventRepository _eventRepo;
        private readonly IEventOptionRepository _eventOptionRepo;
        private readonly IEventParticipantRepository _eventParticipantRepo;
        private readonly ITimePrefRepository _timePrefRepo;
        private readonly GooglePlacesService _googlePlacesService;
        public EventService(IEventRepository eventRepo, IEventOptionRepository eventOptionRepo, 
            IEventParticipantRepository eventPaarticipantRepo, GooglePlacesService googlePlacesService,
            ITimePrefRepository timePrefRepo)
        {
            _eventRepo = eventRepo;
            _eventOptionRepo = eventOptionRepo;
            _eventParticipantRepo = eventPaarticipantRepo;
            _timePrefRepo = timePrefRepo;
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
                Code = await GenerateUniqueCodeAsync(),
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
                CreatedAt = DateTimeOffset.UtcNow,
                OwnerId = userId
            };
            await _eventRepo.AddAsync(newEvent);
            // add creator as organizer participant
            await _eventParticipantRepo.AddEventParticipantAsync(new EventParticipant
            {
                UserId = userId,
                EventId = newEvent.Id,
                Role = EventRoles.Organizator
            });
            return ToDto(newEvent);
        }
        /// <summary>
        /// Deletes an event if the user is the owner.
        /// </summary>
        public async Task<bool> DeleteAsync(Guid eventId, Guid userId)
        {
            var ev = await _eventRepo.GetByIdAsync(eventId);
            if (ev == null || userId != ev.OwnerId)
            {
                return false;
            }
            await _eventRepo.DeleteAsync(ev);
            return true;
        }
        /// <summary>
        /// Retrieves all events as basic DTOs.
        /// </summary>
        public async Task<IEnumerable<EventDto>> GetAllAsync()
        {
            var events = (await _eventRepo.GetAllAsync())
                 .Select(ToDto)
                 .ToList();
            return events;
        }
        /// <summary>
        /// Retrieves detailed event information including participants.
        /// </summary>
        public async Task<DetailedEventDto?> GetByIdAsync(Guid eventId, Guid currentUserId)
        {
            var ev = await _eventRepo.GetByIdWithParticipantsAsync(eventId);

            if (ev == null) return null;

            return new DetailedEventDto
            {
                Id = ev.Id,
                Title = ev.Title,
                Description = ev.Description,
                Mode = ev.Mode,
                IsMultiDay = ev.IsMultiDay,
                Code = ev.Code,
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
            var userEvents =(await _eventRepo.GetByUserParticipation(userId))
                    .Select(e => ToDto(e))
                    .ToList();
            return userEvents;
        }
        /// <summary>
        /// Analyzes user preferences and generates place recommendations using Google Places API.
        /// Determines the most popular place type, optimal location, and best time slot.
        /// </summary>
        /// <param name="eventId">The event's id that is being finalized</param>
        /// <param name="duration"> Organizator sets the duration of the event either in hours for single day events or in days for multiday. </param>
        /// <param name="organizerTypeChoice">If there is a tie of preffered types, it is up to organizer to choose one of them.</param>
    
        public async Task<List<EventOption>> FinalizeFullyOpen(Guid eventId, int? duration = 2, string? organizerTypeChoice = null)
        {
            var ev = await _eventRepo.GetByIdAsync(eventId);
            if (ev == null) throw new Exception("Event not found");

            var locationPrefs = await _eventRepo.GetLocationPreferencesAsync(eventId);

            if (locationPrefs.Count == 0)
                throw new Exception("No location preferences submitted");

            // Most preferred type
            PlaceType topType;
            if (organizerTypeChoice != null && Enum.TryParse<PlaceType>(organizerTypeChoice, out var parsedType))
            {
                // validate organizer's choice is actually among the top types
                var grouped = locationPrefs
                    .GroupBy(p => p.Type)
                    .Select(g => new { Type = g.Key, Count = g.Count() })
                    .OrderByDescending(g => g.Count)
                    .ToList();

                var maxCount = grouped.First().Count;
                var tiedTypes = grouped.Where(g => g.Count == maxCount).Select(g => g.Type).ToList();

                // use organizer choice only if it's among the tied top types
                topType = tiedTypes.Contains(parsedType) ? parsedType : grouped.First().Type;
            }
            else
            {
                topType = locationPrefs
                    .GroupBy(p => p.Type)
                    .OrderByDescending(g => g.Count())
                    .First().Key;
            }

            // Average location
            var avgLat = locationPrefs.Average(p => p.Latitude);
            var avgLng = locationPrefs.Average(p => p.Longitude);

            // get the hour with most availability and center the event duration around it
            var bestDate = await FinalizeFixedPlaceOpenTime(ev, (int)duration!);
            var fromTime = (DateTimeOffset)ev.FinalTimeFrom!;
            var toTime = (DateTimeOffset)ev.FinalTimeTo!;

            var (priceLevel, minRating) = AggregatePreferenceFilters(locationPrefs);
            // generate place suggestions using Google Places API
            var generated = await _googlePlacesService
                .SearchPlacesAsync(ConvertPlaceTypeToString(topType), avgLat, avgLng, eventId,
                                                            fromTime, toTime,priceLevel, minRating);

            await _eventOptionRepo.AddOptionsAsync(generated);

            // mark the event phase as "FinalVoting"
            ev.Phase = EventPhase.FinalVoting;
            await _eventRepo.UpdateAsync(ev);

            return generated;
        }
        public async Task<List<EventOption>> FinalizeFixedTimeOpenPlace(Guid eventId, string? organizerTypeChoice = null)
        {
            var ev = await _eventRepo.GetByIdAsync(eventId);
            if (ev == null) throw new Exception("Event not found");
            
            var locationPrefs = await _eventRepo.GetLocationPreferencesAsync(eventId);

            if (locationPrefs.Count == 0)
                throw new Exception("No location preferences submitted");

            PlaceType topType;
            // Most preferred type
            if (organizerTypeChoice != null && Enum.TryParse<PlaceType>(organizerTypeChoice, out var parsedType))
            {
                // validate organizer's choice is actually among the top types
                var grouped = locationPrefs
                    .GroupBy(p => p.Type)
                    .Select(g => new { Type = g.Key, Count = g.Count() })
                    .OrderByDescending(g => g.Count)
                    .ToList();

                var maxCount = grouped.First().Count;
                var tiedTypes = grouped.Where(g => g.Count == maxCount).Select(g => g.Type).ToList();

                // use organizer choice only if it's among the tied top types
                topType = tiedTypes.Contains(parsedType) ? parsedType : grouped.First().Type;
            }
            else
            {
                topType = locationPrefs
                    .GroupBy(p => p.Type)
                    .OrderByDescending(g => g.Count())
                    .First().Key;
            }

            // Average location
            var avgLat = locationPrefs.Average(p => p.Latitude);
            var avgLng = locationPrefs.Average(p => p.Longitude);

            // Generate places using fixed time

            var (priceLevel, minRating) = AggregatePreferenceFilters(locationPrefs);

            var generated = await _googlePlacesService.SearchPlacesAsync(
                ConvertPlaceTypeToString(topType),
                avgLat,
                avgLng,
                eventId,
                ev.FixedTimeFrom!.Value,
                ev.FixedTimeTo!.Value,
                priceLevel,
                minRating
            );

            await _eventOptionRepo.AddOptionsAsync(generated);
            ev.Phase = EventPhase.FinalVoting;
            await _eventRepo.UpdateAsync(ev);

            return generated;
        }
        public async Task<DateTimeOffset> FinalizeFixedPlaceOpenTime(Event ev, int duration)
        {
            DateTimeOffset bestTime;
            if (ev.IsMultiDay)
            {
                // for multiday use day preferences
                var dayPrefs = await _timePrefRepo.GetAllDayVotes(ev.Id);

                if (dayPrefs.Count == 0)
                    throw new Exception("No day preferences submitted");

                var bestDay = dayPrefs
                    .GroupBy(x => x.Date)
                    .OrderByDescending(g => g.Count())
                    .First().Key;

                // convert the day to DateTimeOffset (start of the day in UTC)
                bestTime = new DateTimeOffset(bestDay.Year, bestDay.Month, bestDay.Day, 0, 0, 0, TimeSpan.Zero);

                var rangeStart = new DateTimeOffset(ev.TimeRangeFrom!.Value.Year, ev.TimeRangeFrom!.Value.Month,
                                                    ev.TimeRangeFrom!.Value.Day, 0, 0, 0, TimeSpan.Zero);
                var rangeEnd = new DateTimeOffset(ev.TimeRangeTo!.Value.Year, ev.TimeRangeTo!.Value.Month, 
                                                  ev.TimeRangeTo!.Value.Day, 0, 0, 0, TimeSpan.Zero);

                var from = bestTime.AddDays(-duration / 2.0);
                var to = bestTime.AddDays(duration / 2.0);

                // if it exceeds the lower limit, move forward
                if (from < rangeStart)
                {
                    
                    from = rangeStart;
                    to = rangeStart.AddDays(duration);
                }
                // if it exceeds the upper limit, move it back
                else if (to > rangeEnd)
                {
                    to = rangeEnd;
                    from = rangeEnd.AddDays(-duration);
                }

                ev.FinalTimeFrom = from;
                ev.FinalTimeTo = to;

            } else {
                var timePrefs = await _eventRepo.GetTimePreferencesWithIntervalsAsync(ev.Id);

                if (timePrefs.Count == 0)
                    throw new Exception("No time preferences submitted");

                // Find most overlapping time
                var timeCounts = new Dictionary<DateTimeOffset, int>();
                foreach (var pref in timePrefs)
                {
                    foreach (var interval in pref.TimeIntervals)
                    {
                        for (var t = interval.From; t < interval.To; t = t.AddHours(1))
                        {
                            var hour = new DateTimeOffset(t.Year, t.Month, t.Day, t.Hour, 0, 0, TimeSpan.Zero); // UTC key

                            if (!timeCounts.ContainsKey(hour))
                                timeCounts[hour] = 0;
                            timeCounts[hour]++;
                        }
                    }
                }
                bestTime = timeCounts.OrderByDescending(kvp => kvp.Value).First().Key;

                var from = bestTime.AddHours(-duration / 2.0);
                var to = bestTime.AddHours(duration / 2.0);

                if (from < ev.TimeRangeFrom)
                {
                    from = (DateTimeOffset)ev.TimeRangeFrom;
                    to = ev.TimeRangeFrom.Value.AddHours(duration);
                }
                else if (to > ev.TimeRangeTo)
                {
                    to = (DateTimeOffset)ev.TimeRangeTo;
                    from = ev.TimeRangeTo.Value.AddHours(-duration);
                }

                ev.FinalTimeFrom = from;
                ev.FinalTimeTo = to;
            }

            // Directly close (no voting phase)
            ev.Phase = EventPhase.Closed;
            ev.FinalPlaceName = ev.FixedPlaceName;
            ev.FinalAddress = ev.FixedAddress;
            await _eventRepo.UpdateAsync(ev);

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
                PlaceType.Bar => "bar",
                PlaceType.Hotel => "lodging",
                PlaceType.Camping => "campground",
                PlaceType.Parc => "parc",
                PlaceType.Museum => "museum",
                PlaceType.Cinema => "movie_theater",
                PlaceType.ShoppingMall => "shopping_mall",
                PlaceType.SportsCenter => "gym",
                _ => "establishment"
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
            Code = e.Code,
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
        /// <summary>
        /// Generates unique code for each event, so it eliminates possibility of collisions.
        /// </summary>
        /// <returns> Unique code for an event </returns>
        private async Task<string> GenerateUniqueCodeAsync()
        {
            const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // bez 0,O,1,I
            const int length = 6;

            while (true)
            {
                var code = new string(Enumerable.Range(0, length)
                    .Select(_ => chars[Random.Shared.Next(chars.Length)])
                    .ToArray());

                var exists = await _eventRepo.HasCodeAsync(code);
                if (!exists)
                    return code;
            }
        }
        private (PriceLevel priceLevel, double minRating) AggregatePreferenceFilters(List<LocationPreference> prefs)
        {
            // averaging
            var avgPrice = prefs.Any(p => p.PreferredPriceLevel != PriceLevel.Any)
                ? (PriceLevel)Math.Round(prefs
                    .Where(p => p.PreferredPriceLevel != PriceLevel.Any)
                    .Average(p => (double)p.PreferredPriceLevel))
                : PriceLevel.Any;

            // average minimal rate
            var avgRating = prefs.Any(p => p.MinRating > 0)
                ? prefs.Where(p => p.MinRating > 0).Average(p => p.MinRating)
                : 0.0;

            return (avgPrice, avgRating);
        }
    }
}