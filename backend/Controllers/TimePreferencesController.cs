// Controllers/TimePreferencesController.cs
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
    [Route("api/events/{eventId}/timePreferences")]
    [Authorize]
    public class TimePreferencesController : ControllerBase
    {
        private readonly IEventRepository _eventRepo;
        private readonly ITimePrefRepository _timePrefRepo;

        public TimePreferencesController(ITimePrefRepository timePrefRepo, IEventRepository eventRepo)
        {
            _timePrefRepo = timePrefRepo;
            _eventRepo = eventRepo;
        }

        // GET: api/events/{eventId}/timePreferences/my
        [HttpGet("my")]
        public async Task<IActionResult> GetMyTimePreference(Guid eventId)
        {
            if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
                return Unauthorized();

            var pref = await _timePrefRepo.GetWithIntervalsAsync(eventId, userId);

            if (pref == null)
                return Ok(null);

            return Ok(new TimePreferenceDto
            {
                TimeIntervals = pref.TimeIntervals.Select(t => new TimeIntervalDto
                {
                    From = DateTime.SpecifyKind(t.From, DateTimeKind.Utc),
                    To = DateTime.SpecifyKind(t.To, DateTimeKind.Utc)
                }).ToList()
            });
        }

        // POST: api/events/{eventId}/timePreferences
        [HttpPost]
        public async Task<IActionResult> SubmitTimePreference(Guid eventId, [FromBody] TimePreferenceDto dto)
        {
            if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
                return Unauthorized();

            var ev = await _eventRepo.GetByIdAsync(eventId);
            if (ev == null) return NotFound("Event not found");

            if (ev.Mode != EventMode.FixedPlaceOpenTime)
                return BadRequest("This endpoint is only for open time events");

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

        // GET: api/events/{eventId}/timePreferences/summary
        [HttpGet("summary")]
        public async Task<IActionResult> GetTimeSummary(Guid eventId)
        {
            var preferences = await _eventRepo.GetTimePreferencesWithIntervalsAsync(eventId);

            var allHours = new List<(DateTime Day, int Hour)>();

            foreach (var pref in preferences)
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

            var summary = allHours
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

            return Ok(summary);
        }
    }
}