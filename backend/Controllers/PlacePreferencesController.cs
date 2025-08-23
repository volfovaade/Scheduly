using backend.Database;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.DTOs;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using backend.Models;
using System.Threading.Tasks;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/events/{eventId}/preferences")]
    [Authorize]
    public class PlacePreferencesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PlacePreferencesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/events/{eventId}/preferences/my
        // Retrieves the logged-in user's submitted place/time preferences for the event.
        [HttpGet("my")]
        public async Task<IActionResult> GetMyPreferences(Guid eventId)
        {
            if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId)){
                return Unauthorized();
            }
            var pref = await _context.PlacePreferences
                .Include(p => p.TimeIntervals)
                .FirstOrDefaultAsync(p => p.EventId == eventId && p.UserId == userId);
            if (pref == null)
            {
                return Ok();
            }
            return Ok(new PlacePreferenceDto
            {
                Type = pref.Type,
                Latitude = pref.Latitude,
                Longitude = pref.Longitude,
                TimeIntervals = pref.TimeIntervals.Select(t => new TimeIntervalDto
                {
                    From = DateTime.SpecifyKind(t.From, DateTimeKind.Utc),
                    To = DateTime.SpecifyKind(t.To, DateTimeKind.Utc)
                }).ToList()
            });
        }

        // POST: api/events/{eventId}/preferences
        // Submits or updates the user's place/time preferences for the event.
        [HttpPost]
        public async Task<IActionResult> Submit (Guid eventId, [FromBody] PlacePreferenceDto dto)
        {
            if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
            {
                return Unauthorized();
            }
            var ev = await _context.Events.FindAsync(eventId);
            if (ev == null) return NotFound("Event not found");

            // deleting existing preferences if any
            var currentPreferences = await _context.PlacePreferences
                .Include(p => p.TimeIntervals)
                .FirstOrDefaultAsync(p => p.EventId == eventId && p.UserId == userId);
            if (currentPreferences != null)
            {
                _context.TimeIntervals.RemoveRange(currentPreferences.TimeIntervals);
                _context.PlacePreferences.Remove(currentPreferences);
            }

            var pref = new PlacePreference
            {
                Id = Guid.NewGuid(),
                EventId = eventId,
                UserId = userId,
                Type = dto.Type,  // place type
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                TimeIntervals = dto.TimeIntervals.Select(t => new TimeInterval
                {
                    Id = Guid.NewGuid(),
                    From = DateTime.SpecifyKind(t.From, DateTimeKind.Utc),
                    To = DateTime.SpecifyKind(t.To, DateTimeKind.Utc)
                }).ToList()
            };
            _context.PlacePreferences.Add(pref);
            await _context.SaveChangesAsync();
            return Ok();
        }

        // GET: api/events/{eventId}/preferences/summary
        // Returns aggregated summary of all participants’ preferred times.
        [HttpGet("summary")]
        public async Task<IActionResult> GetPreferenceSummary(Guid eventId){
            var preferences = await _context.PlacePreferences
                .Include(p => p.TimeIntervals)
                .Where(p => p.EventId == eventId)
                .ToListAsync();

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
                .GroupBy(x => new {x.Day, x.Hour})
                .Select(g => new
                {
                    Day = g.Key.Day.ToString("yyyy-MM-dd"),
                    Hour = g.Key.Hour,
                    Count = g.Count() 
                })
                .OrderBy(g => g.Day).ThenBy(g => g.Hour)
                .ToList();
            return Ok(summary);
        }
    }
}