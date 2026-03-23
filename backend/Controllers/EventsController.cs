using backend.Database;
using backend.DTOs;
using backend.Models;
using backend.Persistence.Interfaces;
using backend.Services.Interfaces;
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
        private readonly IEventRepository _eventRepo;
        private readonly IEventOptionRepository _eventOptionRepo;
        private readonly IVoteRepository _voteRepo;
        private readonly IEventParticipantRepository _eventParticipantRepo;
        private readonly IEmailService _emailService;

        public EventsController(
            IEventService eventService, IEventRepository eventRepo,
            IEventOptionRepository eventOptionRepo, IVoteRepository voteRepo,
            IEventParticipantRepository eventParticipantRepo, IEmailService emailService
            )
        {
            _eventService = eventService;
            _eventRepo = eventRepo;
            _eventOptionRepo = eventOptionRepo;
            _voteRepo = voteRepo;
            _eventParticipantRepo = eventParticipantRepo;
            _emailService = emailService;
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
        // PUT: api/events/{eventID}/description
        [HttpPut("{eventId}/description")]
        public async Task<IActionResult> UpdateEvent(Guid eventId, [FromBody] EventUpdateDto dto)
        {
            if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
                return Unauthorized();
            var ev = await _eventRepo.GetByIdWithParticipantsAsync(eventId);
            if (ev == null)
            {
                return NotFound();
            }
            var isOrganizator = ev.Participants.Any(p => p.UserId == userId && p.Role == EventRoles.Organizator);
            if (!isOrganizator)
            {
                return Forbid();
            }
            ev.Description = dto.Description ?? "";
            await _eventRepo.UpdateAsync(ev);
            return Ok();
        }

        // POST: api/events/{eventId}/finalizeFullyOpen
        // Organizer finalizes proposal phase — generates top place/time options for voting.
        [HttpPost("{eventId}/finalizeFullyOpen")]
        public async Task<IActionResult> FinalizeProposal(Guid eventId, FinalizeWithPlaceDto dto)
        {
            if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
            {
                return Unauthorized();
            }
            var ev = await _eventRepo.GetByIdWithParticipantsAsync(eventId);
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
            try
            {
                var selectedOptions = await _eventService.FinalizeFullyOpen(eventId, dto.Duration, dto.OrganizerPlaceTypeChoice);

                return Ok(selectedOptions);

            }
            catch (Exception err)
            {
                return BadRequest(err.Message);
            }
        }

        [HttpPost("{eventId}/finalizeFixedTimeOpenPlace")]
        public async Task<IActionResult> FinalizeFixedTimeOpenPlace(Guid eventId, FinalizeWithPlaceDto dto)
        {
            if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
                return Unauthorized();

            var ev = await _eventRepo.GetByIdWithParticipantsAsync(eventId);

            if (ev == null) return NotFound();

            var isOrganizer = ev.Participants.Any(p => p.UserId == userId && p.Role == EventRoles.Organizator);
            if (!isOrganizer) return Forbid();

            try
            {
                var options = await _eventService.FinalizeFixedTimeOpenPlace(eventId, dto.OrganizerPlaceTypeChoice);
                return Ok(options);
            }
            catch (Exception err)
            {
                return BadRequest(err.Message);
            }
        }
        // POST: api/events/{eventId}/finalizeFixedPlaceOpenTime
        [HttpPost("{eventId}/finalizeFixedPlaceOpenTime")]
        public async Task<IActionResult> FinalizeFixedPlaceOpenTime(Guid eventId, [FromBody] FinalizeOpenTimeDto dto)
        {
            if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
                return Unauthorized();

            var ev = await _eventRepo.GetByIdWithParticipantsAsync(eventId);

            if (ev == null) return NotFound();

            var isOrganizer = ev.Participants.Any(p => p.UserId == userId && p.Role == EventRoles.Organizator);
            if (!isOrganizer) return Forbid();

            try
            {
                var bestTime = await _eventService.FinalizeFixedPlaceOpenTime(ev, dto.Duration);

                return Ok(new { bestTime, place = ev.FixedPlaceName });
            }
            catch (Exception err)
            {
                var fullMessage = err.Message;
                var inner = err.InnerException;
                while (inner != null)
                {
                    fullMessage += $" | Inner: {inner.Message}";
                    inner = inner.InnerException;
                }
                return BadRequest(fullMessage);
                return BadRequest(err.Message);
            }
        }

        // POST: api/events/{eventId}/close
        // Close endpoint for all event modes
        // Organizer closes the event — set final place/time based on votes.
        [HttpPost("{eventId}/close")]
        public async Task<IActionResult> CloseEvent(Guid eventId)
        {
            if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
            {
                return Unauthorized();
            }
            var ev = await _eventRepo.GetByIdWithParticipantsAsync(eventId);

            if (ev == null)
            {
                return NotFound();
            }

            var isOrganizer = ev.Participants.Any(p => p.UserId == userId && p.Role == EventRoles.Organizator);
            if (!isOrganizer)
            {
                return Forbid();
            }
            // for notification of all participants
            var participants = await _eventParticipantRepo.GetEventParticipantsWithUser(eventId);

            if (ev.Mode == EventMode.SingleOption)
            {
                ev.Phase = EventPhase.Closed;
                ev.FinalPlaceName = ev.FixedPlaceName;
                ev.FinalAddress = ev.FixedAddress;
                ev.FinalTimeFrom = ev.FixedTimeFrom;
                ev.FinalTimeTo = ev.FixedTimeTo;

                await _eventRepo.UpdateAsync(ev);
                await Task.WhenAll(participants.Select(p =>
                    _emailService.SendEventClosedAsync(
                        p.User.Email, p.User.Name,
                        ev.Title,
                        ev.FinalPlaceName!, ev.FinalAddress ?? "",
                        ev.FinalTimeFrom!.Value, ev.FinalTimeTo!.Value
                    )));
                return Ok(new { empty = false });  // no votes for this type of the event, never empty
            }

            // determine vote type based on event phase
            var voteType = ev.Phase == EventPhase.FinalVoting
                ? VoteType.Final
                : VoteType.Preference;

            // find the most preffered option, get detailed object
            var winningOption = await _voteRepo.GetWinningOptionAsync(eventId, voteType);

            if (winningOption == null)
            {
                // maybe send BadRequest No votes found, will be read in eventDetailPage
                return Ok(new { empty = true });
            }

            // save final choice of the event
            ev.Phase = EventPhase.Closed;
            ev.FinalPlaceName = winningOption.PlaceName;
            ev.FinalAddress = winningOption.Address;
            ev.FinalTimeFrom = winningOption.TimeFrom;
            ev.FinalTimeTo = winningOption.TimeTo;

            // Mark winning option
            winningOption.IsSelected = true;

            await _eventRepo.UpdateAsync(ev);
            await _eventOptionRepo.UpdateAsync(winningOption);
            await Task.WhenAll(participants.Select(p =>
                _emailService.SendEventClosedAsync(
                    p.User.Email, p.User.Name,
                    ev.Title,
                    ev.FinalPlaceName!, ev.FinalAddress ?? "",
                    ev.FinalTimeFrom!.Value, ev.FinalTimeTo!.Value
                )));

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

            // Validation based on event mode
            if (dto.Mode == EventMode.CollaborativeOptions ||
                dto.Mode == EventMode.OrganizerOptions ||
                dto.Mode == EventMode.FixedPlaceOpenTime)
            {
                if (dto.TimeRangeFrom == null || dto.TimeRangeTo == null)
                    return BadRequest("This event mode requires time range.");
            }
            if (dto.Mode == EventMode.FixedPlaceOpenTime)
            {
                if (string.IsNullOrEmpty(dto.FixedPlaceName))
                    return BadRequest("Fixed place mode requires place name.");
            }

            if (dto.Mode == EventMode.FixedTimeOpenPlace)
            {
                if (dto.FixedTimeFrom == null || dto.FixedTimeTo == null)
                    return BadRequest("Fixed time mode requires time.");
            }
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