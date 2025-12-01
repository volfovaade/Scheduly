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
    [Route("api/events/{eventId}/options")]
    [Authorize]
    public class EventOptionsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public EventOptionsController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/events/{eventId}/options
        // Adds a new event option (place + time) to a given event.
        // With permission checks and user limits
        [HttpPost]
        public async Task<IActionResult> AddOption(Guid eventId, OptionCreateDto dto)
        {
            var ev = await _context.Events
                .Include(e => e.Participants)
                .FirstOrDefaultAsync(e => e.Id == eventId);

            if (ev == null) return NotFound("Event not found");
            if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
                return Unauthorized();

            // check if event is in proposal phase
            if (ev.Phase != EventPhase.Proposal)
                return BadRequest("Options can only be added during proposal phase");

            // check permissions
            var isOrganizer = ev.Participants.Any(p =>
                p.UserId == userId && p.Role == EventRoles.Organizator);
            if (!ev.AllowParticipantOptions && !isOrganizer)
                return Forbid("Only organizer can add options for this event type");

            //// !!!!!!!!!!!!! NOT NEEDED NOW !!!!!!!!!!!!! check max options per user (except for organizer)
            //if (!isOrganizer)
            //{
            //    var userOptionsCount = await _context.EventOptions
            //        .CountAsync(o => o.EventId == eventId && o.CreatedByUserId == userId);

            //    if (userOptionsCount >= ev.MaxOptionsPerUser)
            //        return BadRequest($"Maximum {ev.MaxOptionsPerUser} options per user");
            //}

            // validate time constraints
            if (ev.Constraint != ConstraintType.None)
            {
                if (dto.TimeFrom < ev.TimeRangeFrom || dto.TimeTo > ev.TimeRangeTo)
                    return BadRequest("Time must be within event time range");
            }
            var option = new EventOption
            {
                Id = Guid.NewGuid(),
                EventId = eventId,
                CreatedByUserId = userId,
                Source = isOrganizer ? OptionSource.System : OptionSource.Manual,
                PlaceName = dto.PlaceName,
                TimeFrom = dto.TimeFrom,
                TimeTo = dto.TimeTo,
                Address = dto.Address,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude
            };

            _context.EventOptions.Add(option);
            await _context.SaveChangesAsync();
            return Ok(option);
        }

        // GET: api/events/{eventId}/options
        // Retrieves all proposed options for the event.
        [HttpGet]
        public async Task<IActionResult> GetOptions(Guid eventId)
        {
            var ev = await _context.Events.FindAsync(eventId);
            if (ev == null) return NotFound("Event not found");

            // Determine which vote type to count based on phase
            var voteType = ev.Phase == EventPhase.FinalVoting
                ? VoteType.Final
                : VoteType.Preference;

            var options = await _context.EventOptions
                .Where(o => o.EventId == eventId)
                .Select(o => new OptionDto
                {
                    Id = o.Id,
                    PlaceName = o.PlaceName,
                    Address = o.Address,
                    Latitude = o.Latitude,
                    Longitude = o.Longitude,
                    TimeFrom = o.TimeFrom,
                    TimeTo = o.TimeTo,
                    Source = o.Source,
                    CreatedByUserId = o.CreatedByUserId,
                    IsSelected = o.IsSelected,
                    VoteCount = o.Votes.Count(v => v.Type == voteType), 
                    TotalScore = o.Votes.Where(v => v.Type == voteType).Sum(v => v.Score)
                })
                .ToListAsync();
            return Ok(options);
        }

        // DELETE: api/events/{eventId}/options
        // Remove option (only creator or organizer)
        [HttpDelete("{optionId}")]
        public async Task<IActionResult> DeleteOption(Guid eventId, Guid optionId)
        {
            if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
                return Unauthorized();

            var option = await _context.EventOptions
                .Include(o => o.Votes)
                .FirstOrDefaultAsync(o => o.Id == optionId && o.EventId == eventId);

            if (option == null) return NotFound();

            var ev = await _context.Events
                .Include(e => e.Participants)
                .FirstOrDefaultAsync(e => e.Id == eventId);

            var isOrganizer = ev!.Participants.Any(p =>
                p.UserId == userId && p.Role == EventRoles.Organizator);

            if (option.CreatedByUserId != userId && !isOrganizer)
                return Forbid("Can only delete your own options");

            _context.EventOptions.Remove(option);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}