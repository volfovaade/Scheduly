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
    [Route("api/join")]
    [Authorize]
    public class JoinController : ControllerBase
    {
        private readonly AppDbContext _context;

        public JoinController(AppDbContext context)
        {
            _context = context;
        }
        [HttpPost("{code}")]
        public async Task<IActionResult> JoinEvent(string code)
        {
            if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
                return Unauthorized();

            var ev = await _context.Events.FirstOrDefaultAsync(e => e.Id.ToString("N").StartsWith(code));
            if (ev == null)
            {
                return NotFound("Event not found");
            }

            bool alreadyJoined = await _context.EventParticipants
                .AnyAsync(p => p.EventId == ev.Id && p.UserId == userId);
            if (!alreadyJoined)
            {
                _context.EventParticipants.Add(new EventParticipant
                {
                    UserId = userId,
                    EventId = ev.Id,
                    Role = EventRoles.Participant
                });
                await _context.SaveChangesAsync();
            }
            return Ok(ev.Id);
        }
    }
}