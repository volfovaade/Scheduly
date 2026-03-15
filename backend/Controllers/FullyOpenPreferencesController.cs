using backend.Database;
using backend.DTOs;
using backend.Models;
using backend.Persistence.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/events/{eventId}/fullyOpenPreferences")]
    [Authorize]
    public class FullyOpenPreferencesController : ControllerBase
    {
        private readonly ILocationPrefRepository _locationPrefRepo;
        private readonly ITimePrefRepository _timePrefRepo;
        private readonly IEventRepository _eventRepo;

        public FullyOpenPreferencesController(ILocationPrefRepository locationPrefRepo, ITimePrefRepository timePrefRepo, IEventRepository eventRepo)
        {
            _locationPrefRepo = locationPrefRepo;
            _timePrefRepo = timePrefRepo;
            _eventRepo = eventRepo;
        }


        // GET: api/events/{eventId}/fullyOpenPreferences/my
        [HttpGet("my")]
        public async Task<IActionResult> GetMyPreferences(Guid eventId)
        {
            if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
                return Unauthorized();
            var ev = await _eventRepo.GetByIdAsync(eventId);
            if (ev == null) return NotFound();

            var locationPref = await _locationPrefRepo.GetAsync(eventId, userId);

            if (ev.IsMultiDay)
            {
                var days = await _timePrefRepo.GetDates(eventId, userId);

                return Ok(new
                {
                    Location = locationPref == null ? null : new LocationPreferenceDto
                    {
                        Type = locationPref.Type,
                        Latitude = locationPref.Latitude,
                        Longitude = locationPref.Longitude
                    },
                    Time = new { Dates = days }
                });
            }

            var timePref = await _timePrefRepo.GetWithIntervalsAsync(eventId, userId);
            return Ok(new
            {
                Location = locationPref == null ? null : new LocationPreferenceDto
                {
                    Type = locationPref.Type,
                    Latitude = locationPref.Latitude,
                    Longitude = locationPref.Longitude
                },
                Time = timePref == null ? null : new TimePreferenceDto
                {
                    TimeIntervals = timePref.TimeIntervals.Select(t => new TimeIntervalDto
                    {
                        From = t.From,
                        To = t.To,
                    }).ToList()
                }
            });
        }

        // POST: api/events/{eventId}/fullyOpenPreference/location
        [HttpPost("location")]
        public async Task<IActionResult> SubmitLocationPreference(Guid eventId, [FromBody] LocationPreferenceDto dto)
        {
            if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
                return Unauthorized();

            var ev = await _eventRepo.GetByIdAsync(eventId);
            if (ev == null) return NotFound("Event not found.");

            if (ev.Mode != EventMode.FullyOpen)
                return BadRequest("This endpoint is only for fully open events");

            // Delete existing preference
            var existing = await _locationPrefRepo.GetAsync(eventId, userId);

            if (existing != null)
                await _locationPrefRepo.DeleteAsync(existing);

            // Add new preference
            var pref = new LocationPreference
            {
                Id = Guid.NewGuid(),
                EventId = eventId,
                UserId = userId,
                Type = dto.Type,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude
            };

            await _locationPrefRepo.AddAsync(pref);

            return Ok();
        }

        // POST: api/events/{eventId}/fullyOpenPreference/time
        [HttpPost("time")]
        public async Task<IActionResult> SubmitTimePreferences(Guid eventId, [FromBody] SubmitTimeDto dto)
        {
            if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
                return Unauthorized();

            var ev = await _eventRepo.GetByIdAsync(eventId);
            if (ev == null) return NotFound("Event not found");

            if (ev.Mode != EventMode.FullyOpen)
                return BadRequest("This endpoint is only for fully open events");

            if (ev.IsMultiDay)
            {
                await _timePrefRepo.RemoveOldVotes(eventId, userId);

                foreach (var date in dto.Dates!)
                {
                    await _timePrefRepo.AddDayPreference(eventId, userId, date);
                }

                return Ok();
            }

            // Delete existing preference
            var existing = await _timePrefRepo.GetWithIntervalsAsync(eventId, userId);

            if (existing != null)
            {
                await _timePrefRepo.DeleteWithIntervalsAsync(existing);
            }

            // Add new preference
            var prefId = Guid.NewGuid();
            var pref = new TimePreference
            {
                Id = prefId,
                EventId = eventId,
                UserId = userId,
                TimeIntervals = dto.TimeIntervals!.Select(t => new TimeInterval
                {
                    Id = Guid.NewGuid(),
                    From = t.From,
                    To = t.To,
                    TimePreferenceId = prefId
                }).ToList()
            };

            await _timePrefRepo.AddAsync(pref);

            return Ok();
        }

        // GET: api/events/{eventId}/fullyOpenPreferences/summary
        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary(Guid eventId)
        {
            // Location summary
            var locationPrefs = await _eventRepo.GetLocationPreferencesAsync(eventId);

            var locationSummary = locationPrefs.Any() ? new
            {
                TotalSubmissions = locationPrefs.Count,
                AverageLatitude = locationPrefs.Average(p => p.Latitude),
                AverageLongitude = locationPrefs.Average(p => p.Longitude),
                TypeCounts = locationPrefs.GroupBy(p => p.Type)
                    .Select(g => new { Type = g.Key.ToString(), Count = g.Count() })
                    .ToList()
            } : null;

            // Time summary
            var ev = await _eventRepo.GetByIdAsync(eventId);
            if (ev == null) return NotFound();

            if (ev.IsMultiDay)
            {
                var dayPrefs = await _timePrefRepo.GetAllDayVotes(eventId);
                var result = dayPrefs
                    .GroupBy(x => x.Date)
                    .Select(g => new
                    {
                        Day = g.Key,
                        Count = g.Count()
                    })
                    .OrderByDescending(x => x.Count)
                    .ToList();

                return Ok(new { Location = locationSummary, Time = result });
            }
            var timePrefs = await _eventRepo.GetTimePreferencesWithIntervalsAsync(eventId);

            var hours = timePrefs
                .SelectMany(p =>
                    p.TimeIntervals.SelectMany(interval =>
                    {
                        var list = new List<(DateOnly Day, int Hour)>();
                        var current = interval.From;

                        while (current < interval.To)
                        {
                            list.Add((DateOnly.FromDateTime(current.DateTime), current.Hour));
                            current = current.AddHours(1);
                        }

                        return list;
                    })
                )
                .GroupBy(x => x)
                .Select(g => new
                {
                    Day = g.Key.Day,
                    Hour = g.Key.Hour,
                    Count = g.Count()
                })
                .OrderByDescending(x => x.Count)
                .ToList();

            return Ok(new { Location = locationSummary, Time = hours });
        }

    }

}