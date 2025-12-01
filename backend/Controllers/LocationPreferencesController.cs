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
    [Route("api/events/{eventId}/locationPreferences")]
    [Authorize]
    public class LocationPreferencesController : ControllerBase
    {
        private readonly AppDbContext _context;
        public LocationPreferencesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/events/{eventId}/locationPreferences/my
        [HttpGet("my")]
        public async Task<IActionResult> GetMyLocationPreferences(Guid eventId)
        {
            if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
            {
                return Unauthorized();
            }
            var pref = await _context.LocationPreferences
                .FirstOrDefaultAsync(p => p.EventId == eventId && p.UserId == userId);
            if (pref == null)
            {
                return Ok(null);
            }
            return Ok(new LocationPreferenceDto
            {
                Type = pref.Type,
                Latitude = pref.Latitude,
                Longitude = pref.Longitude
            });
        }

        // POST: api/events/{eventId}/locationPreferences
        [HttpPost]
        public async Task<IActionResult> SubmitLocationPreference(Guid eventId, [FromBody] LocationPreferenceDto dto)
        {
            if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
                return Unauthorized();

            var ev = await _context.Events.FindAsync(eventId);
            if (ev == null) return NotFound("Event not found");

            if (ev.Mode != EventMode.FixedTimeOpenPlace)
                return BadRequest("This endpoint is only for open place events");

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
        // GET: api/events/{eventId}/locationPreferences/summary
        [HttpGet("summary")]
        public async Task<IActionResult> GetLocationSummary(Guid eventId)
        {
            var preferences = await _context.LocationPreferences
                .Where(p => p.EventId == eventId)
                .ToListAsync();

            var summary = new
            {
                TotalSubmissions = preferences.Count,
                AverageLatitude = preferences.Average(p => p.Latitude),
                AverageLongitude = preferences.Average(p => p.Longitude),
                TypeCounts = preferences.GroupBy(p => p.Type)
                    .Select(g => new { Type = g.Key.ToString(), Count = g.Count() })
                    .ToList()
            };

            return Ok(summary);
        }
    }
}