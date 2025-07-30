using backend.Database;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/events/{eventId}/participants")]
    [Authorize]
    public class EventParticipantController : ControllerBase
    {
        private readonly AppDbContext _context;
        public EventParticipantController(AppDbContext context)
        {
            _context = context;
        }
        // GET: Get list of all participants for the event
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetParticipants(Guid eventId)
        {
            var participants = await _context.EventParticipants
                .Include(p => p.User)
                .Where(p => p.EventId == eventId)
                .Select(p => new{
                    p.UserId,
                    p.User.Name,
                    p.Role
                }).ToListAsync();

            return Ok(participants);
        }

        // POST: Join event as a participant
        [HttpPost("join")]
        public async Task<IActionResult> JoinEvent(Guid eventId)
        {
            if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
            {
                return Unauthorized();
            }
            // check if already a participant
            var existing = await _context.EventParticipants
                .FirstOrDefaultAsync(p => p.UserId == userId && p.EventId == eventId);
            if (existing != null)
            {
                return BadRequest("User already joined the event");
            }
            _context.EventParticipants.Add(new EventParticipant
            {
                UserId = userId,
                EventId = eventId,
                Role = EventRoles.Participant
            });
            await _context.SaveChangesAsync();
            return Ok("Successfully joined event");
        }

        // DELETE: Leave an event
        [HttpDelete("leave")]
        public async Task<IActionResult> LeaveEvent (Guid eventId)
        {
            if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
                return Unauthorized();

            var participant = await _context.EventParticipants
                .FirstOrDefaultAsync(p => p.EventId == eventId && p.UserId == userId);
            if (participant == null)
                return NotFound("Not a participant of this event.");

            _context.EventParticipants.Remove(participant);
            await _context.SaveChangesAsync();
            return Ok("Left the event.");
        }
    }
}