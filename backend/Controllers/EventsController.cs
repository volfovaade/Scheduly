using backend.DTOs;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class EventsController : ControllerBase
    {
        private readonly IEventService _eventService;

        public EventsController(IEventService eventService)
        {
            _eventService = eventService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Event>>> GetAll()
        {
            return Ok(await _eventService.GetAllAsync());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Event>> GetById(Guid id)
        {
            var ev = await _eventService.GetByIdAsync(id);
            return ev == null ? NotFound() : Ok(ev);
        }

        [HttpGet("my")]
        public async Task<ActionResult<IEnumerable<Event>>> GetMyEvents()
        {
            if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
                return Unauthorized();

            var myEvents = await _eventService.GetUserEventsAsync(userId);
            return Ok(myEvents);
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<Event>> Create(EventCreateDto dto)
        {
            if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
            {
                return Unauthorized();
            }
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