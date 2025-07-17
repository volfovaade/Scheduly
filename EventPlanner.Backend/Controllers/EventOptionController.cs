using EventPlanner.Backend.Database;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EventPlanner.Backend.DTOs;
using EventPlanner.Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace EventPlanner.Backend.Controllers
{
    [ApiController]
    [Route("api/events/{eventId}/options")]
    [Authorize]
    public class EventOptionsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public EventOptionsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> AddOption(Guid eventId, OptionCreateDto dto)
        {
            var ev = await _context.Events.FindAsync(eventId);
            if (ev == null) return NotFound("Event not found");

            var option = new EventOption
            {
                Id = Guid.NewGuid(),
                EventId = eventId,
                PlaceName = dto.PlaceName,
                TimeFrom = dto.TimeFrom,
                TimeTo = dto.TimeTo,
                Location = dto.Location
            };

            _context.EventOptions.Add(option);
            await _context.SaveChangesAsync();
            return Ok(option);
        }

        [HttpGet]
        public async Task<IActionResult> GetOptions(Guid eventId)
        {
            var options = await _context.EventOptions.Where(o => o.EventId == eventId).ToListAsync();
            return Ok(options);
        }
    }
}