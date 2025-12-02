using backend.Database;
using backend.Repositories.Interfaces;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Authorize(Roles = "Admin")]
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
            return Ok(suspiciousUsers);
        }

        // DELETE: api/admin/events/cleanup
        // Deletes events created year ago without any participant
        // Returns number of deleted events
        [HttpDelete("events/cleanup")]
        public async Task<IActionResult> CleanupOldEvents()
        {
            var oldDate = DateTime.UtcNow.AddYears(-1);
            var oldEvents = await _eventRepo.GetOldEventsAsync(oldDate);
            await _eventRepo.DeleteAsync(oldEvents);

            return Ok(new { deletedCount = oldEvents.Count });
        }
    }

}