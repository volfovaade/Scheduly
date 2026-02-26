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
            var ev = await _eventRepo.GetByIdAsync(eventId);
            if (ev == null) return NotFound("Event not found");

            if (ev.IsMultiDay)
            {
                var days = await _timePrefRepo.GetDates(eventId, userId);

                return Ok(new
                {
                    Time = new { Dates = days }
                });
            }

            var pref = await _timePrefRepo.GetWithIntervalsAsync(eventId, userId);

            if (pref == null)
                return Ok(null);

            return Ok(new TimePreferenceDto
            {
                TimeIntervals = pref.TimeIntervals.Select(t => new TimeIntervalDto
                {
                    From = t.From,
                    To = t.To,
                }).ToList()
            });
        }

        // POST: api/events/{eventId}/timePreferences
        [HttpPost]
        public async Task<IActionResult> SubmitTimePreference(Guid eventId, [FromBody] SubmitTimeDto dto)
        {
            if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
                return Unauthorized();

            var ev = await _eventRepo.GetByIdAsync(eventId);
            if (ev == null) return NotFound("Event not found");

            if (ev.Mode != EventMode.FixedPlaceOpenTime)
                return BadRequest("This endpoint is only for open time events");
            
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
            
            Console.WriteLine(pref);

            await _timePrefRepo.AddAsync(pref);

            return Ok();
        }

        // GET: api/events/{eventId}/timePreferences/summary
        [HttpGet("summary")]
        public async Task<IActionResult> GetTimeSummary(Guid eventId)
        {
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

                return Ok(new {Time = result });
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

            return Ok(new {Time = hours });
        }
    }
}