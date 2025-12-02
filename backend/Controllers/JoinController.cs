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
    [Route("api/join")]
    [Authorize]
    public class JoinController : ControllerBase
    {
        private readonly IEventRepository _eventRepo;
        private readonly IEventParticipantRepository _eventParticipantRepo;

        public JoinController(IEventRepository eventRepo, IEventParticipantRepository eventParticipantRepo)
        {
            _eventRepo = eventRepo;
            _eventParticipantRepo = eventParticipantRepo;
        }

        // POST: api/join/{code}
        // Allows a user to join an event using a short code (prefix of event GUID).
        [HttpPost("{code}")]
        public async Task<IActionResult> JoinEvent(string code) 
        {
            if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
                return Unauthorized();

            var ev = await _eventRepo.GetByCodeAsync(code);
            if (ev == null)
            {
                return NotFound("Event not found");
            }
            if (ev.OwnerId == userId)
            {
                return BadRequest("You are already the owner of this event");
            }
                
            var existingParticipant = await _eventParticipantRepo.GetParticipantAsync(ev.Id, userId);
            if (existingParticipant == null)
            {
                await _eventParticipantRepo.AddEventParticipantAsync(new EventParticipant
                {
                    UserId = userId,
                    EventId = ev.Id,
                    Role = EventRoles.Participant
                });
            }
            return Ok(new {
                id = ev.Id,
                mode = ev.Mode,
                phase = ev.Phase,
                title = ev.Title,
                allowParticipantOptions = ev.AllowParticipantOptions
            });
        }
    }
}