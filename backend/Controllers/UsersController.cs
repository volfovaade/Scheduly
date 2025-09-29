using backend.Database;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsersController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/users/{userId}
        // Retrieves user profile information by ID.
        [HttpGet("{userId}")]
        public async Task<IActionResult> GetUserById(Guid userId)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null) return NotFound();
            return Ok(ToUserDto(user));
        }

        private static UserDto ToUserDto(User user) => new UserDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role?.Name ?? Roles.User
        };
    }
}