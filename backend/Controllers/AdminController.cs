using backend.Database;
using backend.Models;
using backend.Persistence.Interfaces;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Authorize(Roles = "Admin")]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly IUserRepository _userRepo;
        private readonly IEventRepository _eventRepo;

        public AdminController(IUserRepository userRepo, IEventRepository eventRepo)
        {
            _userRepo = userRepo;
            _eventRepo = eventRepo;
        }
        // GET: api/admin/users/suspicious
        // Returns all of the suspicious users that have more than 50 events
        [HttpGet("users/suspicious")]
        public async Task<IActionResult> GetSuspiciousUsers()
        {
            var suspiciousUsers = await _userRepo.GetSuspiciousUsersAsync();
            var result = new List<object>();

            foreach (var u in suspiciousUsers)
            {
                result.Add(new
                {
                    u.Id,
                    u.Email,
                    EventCount = await _userRepo.GetNumberOfUsersEvents(u.Id),
                    Reason = "Excessive creation"
                });
            }

            return Ok(result);
        }
        // DELETE: api/admin/users/{id}
        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            var user = await _userRepo.GetByIdAsync(id);
            if (user == null) return NotFound("User not found");

            // first delete user events
            var userEvents = await _eventRepo.GetByOwnerIdAsync(id);
            await _eventRepo.DeleteAsync(userEvents);

            await _userRepo.DeleteAsync(user);

            return Ok(new { message = "User and all associated data deleted successfully." });
        }

        // GET: api/admin/events/cleanup?daysOld=365
        [HttpGet("events/cleanup")]
        public async Task<IActionResult> GetEventsForCleanup([FromQuery] int daysOld = 365)
        {
            var thresholdDate = DateTimeOffset.UtcNow.AddDays(-daysOld);
            var oldEvents = await _eventRepo.GetOldEventsAsync(thresholdDate);
            return Ok(oldEvents);
        }

        // DELETE: api/admin/events/cleanup?daysOld=365
        // Deletes events created from query days ago
        // Returns number of deleted events

        [HttpDelete("events/cleanup")]
        public async Task<IActionResult> CleanupOldEvents([FromQuery] int daysOld = 365)
        {
            if (daysOld < 0) return BadRequest("Days cannot be negative");

            var thresholdDate = DateTimeOffset.UtcNow.AddDays(-daysOld);
            var oldEvents = await _eventRepo.GetOldEventsAsync(thresholdDate);
            await _eventRepo.DeleteAsync(oldEvents);
            return Ok(new { deletedCount = oldEvents.Count });
        }
    }

}