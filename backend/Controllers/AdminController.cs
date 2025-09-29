using backend.Database;
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
        private readonly AppDbContext _context;

        public AdminController(AppDbContext context)
        {
            _context = context;
        }
        // GET: api/admin/users/suspicious
        // Returns all of the suspicious users that have more than 50 events
        [HttpGet("users/suspicious")]
        public async Task<IActionResult> GetSuspiciousUsers()
        {
            var suspiciousUsers = await _context.Users
                    .Where(u => u.Events.Count > 50)
                    .ToListAsync();
            return Ok(suspiciousUsers);
        }

        // DELETE: api/admin/events/cleanup
        // Deletes events created year ago without any participant
        // Returns number of deleted events
        [HttpDelete("events/cleanup")]
        public async Task<IActionResult> CleanupOldEvents()
        {
            var oldDate = DateTime.UtcNow.AddYears(-1);
            var oldEvents = await _context.Events
                    .Where(e => e.CreatedAt < oldDate && e.Participants.Count == 0)
                    .ToListAsync();
            _context.Events.RemoveRange(oldEvents);
            await _context.SaveChangesAsync();
            return Ok(new { deletedCount = oldEvents.Count });
        }
    }

}