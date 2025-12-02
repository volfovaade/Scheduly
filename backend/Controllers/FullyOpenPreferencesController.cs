using backend.Database;
using backend.DTOs;
using backend.Models;
using backend.Repositories.Interfaces;
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
            var locationPref = await _locationPrefRepo.GetAsync(eventId, userId);
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
                        From = DateTime.SpecifyKind(t.From, DateTimeKind.Utc),
                        To = DateTime.SpecifyKind(t.To, DateTimeKind.Utc)
                    }).ToList()
                }
            });
        }

        // POST: api/events/{eventId}/fullyOpenPreference/location
        [HttpPost("location")]
        public async Task<IActionResult> SubmitLocationPreference(Guid eventId, [FromBody]LocationPreferenceDto dto)
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
        public async Task<IActionResult> SubmitTimePreferences(Guid eventId, [FromBody]TimePreferenceDto dto)
        {
            if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
                return Unauthorized();

            var ev = await _eventRepo.GetByIdAsync(eventId);
            if (ev == null) return NotFound("Event not found");

            if (ev.Mode != EventMode.FullyOpen)
                return BadRequest("This endpoint is only for fully open events");

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
                TimeIntervals = dto.TimeIntervals.Select(t => new TimeInterval
                {
                    Id = Guid.NewGuid(),
                    From = DateTime.SpecifyKind(t.From, DateTimeKind.Utc),
                    To = DateTime.SpecifyKind(t.To, DateTimeKind.Utc),
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
            var timePrefs = await _eventRepo.GetTimePreferencesWithIntervalsAsync(eventId);

            var allHours = new List<(DateTime Day, int Hour)>();
            foreach (var pref in timePrefs)
            {
                foreach (var interval in pref.TimeIntervals)
                {
                    var current = interval.From;
                    var end = interval.To;
                    while (current <= end)
                    {
                        allHours.Add((current.Date, current.Hour));
                        current = current.AddHours(1);
                    }
                }
            }

            var timeSummary = allHours
                .GroupBy(x => new { x.Day, x.Hour })
                .Select(g => new
                {
                    Day = g.Key.Day.ToString("yyyy-MM-dd"),
                    Hour = g.Key.Hour,
                    Count = g.Count()
                })
                .OrderByDescending(g => g.Count)
                .ThenBy(g => g.Day)
                .ThenBy(g => g.Hour)
                .ToList();

            return Ok(new
            {
                Location = locationSummary,
                Time = timeSummary
            });
        }
    }
}