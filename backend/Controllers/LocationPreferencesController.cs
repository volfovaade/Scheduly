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
    [Route("api/events/{eventId}/locationPreferences")]
    [Authorize]
    public class LocationPreferencesController : ControllerBase
    {
        private readonly IEventRepository _eventRepo;
        private readonly ILocationPrefRepository _locationPrefRepo;
        public LocationPreferencesController(ILocationPrefRepository locationPrefRepo, IEventRepository eventRepo)
        {
            _locationPrefRepo = locationPrefRepo;
            _eventRepo = eventRepo;
        }

        // GET: api/events/{eventId}/locationPreferences/my
        [HttpGet("my")]
        public async Task<IActionResult> GetMyLocationPreferences(Guid eventId)
        {
            if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
            {
                return Unauthorized();
            }
            var pref = await _locationPrefRepo.GetAsync(eventId, userId);
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

            var ev = await _eventRepo.GetByIdAsync(eventId);
            if (ev == null) return NotFound("Event not found");

            if (ev.Mode != EventMode.FixedTimeOpenPlace)
                return BadRequest("This endpoint is only for open place events");

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
        // GET: api/events/{eventId}/locationPreferences/summary
        [HttpGet("summary")]
        public async Task<IActionResult> GetLocationSummary(Guid eventId)
        {
            var preferences = await _eventRepo.GetLocationPreferencesAsync(eventId);

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