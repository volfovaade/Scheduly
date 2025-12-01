using backend.Database;
using backend.DTOs;
using backend.Models;
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
        private readonly AppDbContext _context;

        public FullyOpenPreferencesController(AppDbContext context)
        {
            _context = context; 
        }

        // GET: api/events/{eventId}/fullyOpenPreferences/my
        [HttpGet("my")]
        public async Task<IActionResult> GetMyPreferences(Guid eventId)
        {
            if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
                return Unauthorized();
            var locationPref = await _context.LocationPreferences
                .FirstOrDefaultAsync(p => p.EventId == eventId && p.UserId == userId);
            var timePref = await _context.TimePreferences
                .Include(p => p.TimeIntervals)
                .FirstOrDefaultAsync(p => p.EventId == eventId && p.UserId == userId);
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

            var ev = await _context.Events.FindAsync(eventId);
            if (ev == null) return NotFound("Event not found.");

            if (ev.Mode != EventMode.FullyOpen)
                return BadRequest("This endpoint is only for fully open events");

            // Delete existing preference
            var existing = await _context.LocationPreferences
                .FirstOrDefaultAsync(p => p.EventId == eventId && p.UserId == userId);

            if (existing != null)
                _context.LocationPreferences.Remove(existing);

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

            _context.LocationPreferences.Add(pref);
            await _context.SaveChangesAsync();

            return Ok();
        }

        // POST: api/events/{eventId}/fullyOpenPreference/time
        [HttpPost("time")]
        public async Task<IActionResult> SubmitTimePreferences(Guid eventId, [FromBody]TimePreferenceDto dto)
        {
            if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
                return Unauthorized();

            var ev = await _context.Events.FindAsync(eventId);
            if (ev == null) return NotFound("Event not found");

            if (ev.Mode != EventMode.FullyOpen)
                return BadRequest("This endpoint is only for fully open events");

            // Delete existing preference
            var existing = await _context.TimePreferences
                .Include(p => p.TimeIntervals)
                .FirstOrDefaultAsync(p => p.EventId == eventId && p.UserId == userId);

            if (existing != null)
            {
                _context.TimeIntervals.RemoveRange(existing.TimeIntervals);
                _context.TimePreferences.Remove(existing);
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

            _context.TimePreferences.Add(pref);
            await _context.SaveChangesAsync();

            return Ok();
        }
        // GET: api/events/{eventId}/fullyOpenPreferences/summary
        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary(Guid eventId)
        {
            // Location summary
            var locationPrefs = await _context.LocationPreferences
                .Where(p => p.EventId == eventId)
                .ToListAsync();

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
            var timePrefs = await _context.TimePreferences
                .Include(p => p.TimeIntervals)
                .Where(p => p.EventId == eventId)
                .ToListAsync();

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