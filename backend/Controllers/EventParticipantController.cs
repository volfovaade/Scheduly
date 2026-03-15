using backend.Database;
using backend.Models;
using backend.Persistence.Interfaces;
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
        private readonly IEventParticipantRepository _eventParticipantRepo;
        private readonly IVoteRepository _voteRepo;
        public EventParticipantController(IEventParticipantRepository eventParticipantRepository, IVoteRepository voteRepo)
        {
            _eventParticipantRepo = eventParticipantRepository;
            _voteRepo = voteRepo;
        }

        // GET: api/events/{eventId}/participants
        // Returns all participants of a given event with their roles.
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetParticipants(Guid eventId)
        {
            var participants = (await _eventParticipantRepo.GetEventParticipantsWithUser(eventId))
                .Select(p => new
                {
                    p.UserId,
                    p.User.Name,
                    p.Role
                });
            return Ok(participants);
        }

        // POST: api/events/{eventId}/participants/join
        // Allows the logged-in user to join the event as a participant.
        [HttpPost("join")]
        public async Task<IActionResult> JoinEvent(Guid eventId)
        {
            if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
            {
                return Unauthorized();
            }
            // check if already a participant
            var existing = await _eventParticipantRepo.GetParticipantAsync(eventId, userId);
            if (existing != null)
            {
                return BadRequest("User already joined the event");
            }
            await _eventParticipantRepo.AddEventParticipantAsync(new EventParticipant
            {
                UserId = userId,
                EventId = eventId,
                Role = EventRoles.Participant
            });

            return Ok("Successfully joined event");
        }

        // DELETE: api/events/{eventId}/participants/leave
        // Allows the logged-in user to leave the event.
        [HttpDelete("leave")]
        public async Task<IActionResult> LeaveEvent(Guid eventId)
        {
            if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
                return Unauthorized();

            var participant = await _eventParticipantRepo.GetParticipantAsync(eventId, userId);
            if (participant == null)
                return NotFound("Not a participant of this event.");

            // delete all votes connected with this user leaving the event
            await _voteRepo.DeleteUserVotesAsync(eventId, userId);
            await _eventParticipantRepo.DeleteEventParticipantAsync(participant);

            return Ok("Left the event.");
        }
    }
}