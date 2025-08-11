using backend.Database;
using backend.DTOs;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class EventsController : ControllerBase
    {
        private readonly IEventService _eventService;
        private readonly AppDbContext _context;

        public EventsController(IEventService eventService, AppDbContext context)
        {
            _eventService = eventService;
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<EventDto>>> GetAll()
        {
            return Ok(await _eventService.GetAllAsync());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<DetailedEventDto>> GetById(Guid id)
        {
            if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var currentUserId))
            {
                return Unauthorized();
            }
            var ev = await _eventService.GetByIdAsync(id, currentUserId);
            return ev == null ? NotFound() : Ok(ev);
        }

        [HttpGet("my")]
        public async Task<ActionResult<IEnumerable<EventDto>>> GetMyEvents()
        {
            if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
                return Unauthorized();

            var myEvents = await _eventService.GetUserEventsAsync(userId);
            return Ok(myEvents);
        }

        [HttpPost("{eventId}/finalize")]
        public async Task<IActionResult> FinalizeProposal(Guid eventId, [FromQuery] int radius, [FromQuery] int duration)
        {
            if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
            {
                return Unauthorized();
            }
            var ev = await _context.Events
                .Include(e => e.Participants)
                .FirstOrDefaultAsync(e => e.Id == eventId);
            if (ev == null)
            {
                return NotFound();
            }
            var isOrganizer = ev.Participants.Any(p => p.UserId == userId && p.Role == EventRoles.Organizator);
            if (!isOrganizer)
            {
                return Forbid();
            }
            // calling algorithm for top options
            try {
                //// musim zastavit generovani je nekonecen nebo hodne dlouhe nejak omezit jen na tri odpovedi!!!!!!!!
                var selectedOptions = await _eventService.FinalizeProposalPhase(eventId, radius*1000, duration);

                // mark the event phase as "FinalVoting"
                ev.Phase = EventPhase.FinalVoting;
                await _context.SaveChangesAsync();
                return Ok(selectedOptions);

            } catch (Exception err) {
                return BadRequest(err.Message);
            }
        }

        [HttpPost("{eventId}/close")]
        public async Task<IActionResult> CloseEvent(Guid eventId)
        {
            if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
            {
                return Unauthorized();
            }
            var ev = await _context.Events
                .Include(e => e.Participants)
                .FirstOrDefaultAsync(e => e.Id == eventId);

            if (ev == null)
            {
                return NotFound();
            }

            var isOrganizer = ev.Participants.Any(p => p.UserId == userId && p.Role == EventRoles.Organizator);
            if (!isOrganizer)
            {
                return Forbid();
            }

            // find the most preffered option
            var winningOption = await _context.FinalVotes
                .Where(v => v.EventId == eventId)
                .GroupBy(v => v.OptionId)
                .Select(g => new { OptionId = g.Key, Count = g.Count() })
                .OrderByDescending(g => g.Count)
                .Join(_context.GeneratedPlaceOptions,
                    g => g.OptionId,
                    o => o.Id,
                    (g, o) => o)
                .FirstOrDefaultAsync();

            if (winningOption  == null)
            {
                return BadRequest("No votes were cast");
            }

            // save final choice of the event
            ev.Phase = EventPhase.Closed;
            ev.FinalPlaceName = winningOption.PlaceName;
            ev.FinalAddress = winningOption.Adress;
            ev.FinalTimeFrom = winningOption.TimeFrom;
            ev.FinalTimeTo = winningOption.TimeTo;

            await _context.SaveChangesAsync();

            return Ok(winningOption);
        }

        [HttpPost]
        public async Task<ActionResult<EventDto>> Create([FromBody] EventCreateDto dto)
        {
            if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
            {
                return Unauthorized();
            }
            if (dto.Mode == EventMode.Open && (dto.TimeRangeFrom == null || dto.TimeRangeTo == null))
                return BadRequest("Open event requires range.");

            var created = await _eventService.CreateAsync(userId, dto);
            return CreatedAtAction(nameof(GetAll), new { id = created.Id }, created);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
                return Unauthorized();

            var success = await _eventService.DeleteAsync(id, userId);
            return success ? NoContent() : Forbid("Only the owner is permitted to delete this event.");
        }
    }
}