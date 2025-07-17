using EventPlanner.Backend.DTOs;
using EventPlanner.Backend.Models;
using EventPlanner.Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EventPlanner.Backend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class EventController : ControllerBase
    {
        private readonly IEventService _eventService;

        public EventController(IEventService eventService)
        {
            _eventService = eventService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Event>>> GetAll()
        {
            return Ok(await _eventService.GetAllAsync());
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<Event>> Create(EventCreateDto dto)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var created = await _eventService.CreateAsync(userId, dto);
            return CreatedAtAction(nameof(GetAll), new { id = created.Id }, created);
        }
    }
}