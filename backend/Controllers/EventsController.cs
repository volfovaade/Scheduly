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

        // GET: api/events
        // Returns a list of all events.
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EventDto>>> GetAll()
        {
            return Ok(await _eventService.GetAllAsync());
        }

        // GET: api/events/{id}
        // Returns full details of a specific event, checking current user's access.
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

        // GET: api/events/my
        // Returns all events that the current user is a participant of (or organizator).
        [HttpGet("my")]
        public async Task<ActionResult<IEnumerable<EventDto>>> GetMyEvents()
        {
            if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
                return Unauthorized();

            var myEvents = await _eventService.GetUserEventsAsync(userId);
            return Ok(myEvents);
        }

        // POST: api/events/{eventId}/finalize
        // Organizer finalizes proposal phase — generates top place/time options for voting.
        [HttpPost("{eventId}/finalize")]
        public async Task<IActionResult> FinalizeProposal(Guid eventId, [FromQuery] int duration)
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
                var selectedOptions = await _eventService.FinalizeProposalPhase(eventId, duration);

                // mark the event phase as "FinalVoting"
                ev.Phase = EventPhase.FinalVoting;
                await _context.SaveChangesAsync();
                return Ok(selectedOptions);

            } catch (Exception err) {
                return BadRequest(err.Message);
            }
        }

        // POST: api/events/{eventId}/closeOpen
        // Organizer closes the event — sets final place/time based on votes.
        [HttpPost("{eventId}/closeOpen")]
        public async Task<IActionResult> CloseOpenEvent(Guid eventId)
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

            // find the most preffered option, get detailed object
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

            if (winningOption == null)
            {
                return Ok(new { empty = true });
            }

            // save final choice of the event
            ev.Phase = EventPhase.Closed;
            ev.FinalPlaceName = winningOption.PlaceName;
            ev.FinalAddress = winningOption.Address;
            ev.FinalTimeFrom = winningOption.TimeFrom;
            ev.FinalTimeTo = winningOption.TimeTo;

            await _context.SaveChangesAsync();

            return Ok(winningOption);
        }

        // POST: api/events/{eventId}/closeFixed
        // Organizer closes the event — sets final place/time based on votes.
        [HttpPost("{eventId}/closeFixed")]
        public async Task<IActionResult> CloseFixedEvent(Guid eventId)
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
            var votesCount = await _context.Votes
                .Where(v => v.Option.EventId == eventId)
                .GroupBy(v => v.OptionId)
                .Select(g => new { OptionId = g.Key, Count = g.Count() })
                .OrderByDescending(g => g.Count)
                .ToListAsync();

            var winningVoteGroup = votesCount.FirstOrDefault();
            if (winningVoteGroup == null)
            {
                return Ok(new { empty = true });
            }
            var winningOptionId = winningVoteGroup.OptionId;

            // load details of the most preffered option
            var winningOption = await _context.EventOptions
                .FirstOrDefaultAsync(o => o.Id == winningOptionId);
            if (winningOption == null)
            {
                return Ok(new { empty = true });
            }

            // save final choice of the event
            ev.Phase = EventPhase.Closed;
            ev.FinalPlaceName = winningOption.PlaceName;
            ev.FinalAddress = winningOption.Location ?? "No location was given";
            ev.FinalTimeFrom = winningOption.TimeFrom;
            ev.FinalTimeTo = winningOption.TimeTo;

            await _context.SaveChangesAsync();

            return Ok(winningOption);
        }

        // POST: api/events
        // Creates a new event owned by the current user.
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

        // DELETE: api/events/{id}
        // Deletes the event if the current user is the owner.
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