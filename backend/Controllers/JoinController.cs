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
        [HttpPost("{token}")]
        public async Task<IActionResult> JoinEvent(string token)
        {
            var ev = await _context.Events.FirstOrDefaultAsync(e => e.Id.ToString().StartsWith(token));
            if (ev == null)
            {
                return NotFound("Event not found");
            }
            if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
                return Unauthorized();
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
            return Ok("Joined successfully");
        }
    }
}