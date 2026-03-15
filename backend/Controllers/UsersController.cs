using backend.Database;
using backend.DTOs;
using backend.Models;
using backend.Persistence.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly IUserRepository _userRepo;

        public UsersController(IUserRepository userRepo)
        {
            _userRepo = userRepo;
        }

        // GET: api/users/{userId}
        // Retrieves user profile information by ID.
        [HttpGet("{userId}")]
        public async Task<IActionResult> GetUserById(Guid userId)
        {
            var user = await _userRepo.GetByIdAsync(userId);
            if (user == null) return NotFound();
            return Ok(ToUserDto(user));
        }

        // GET /api/users/{id}/stats
        [HttpGet("{id}/stats")]
        [Authorize]
        public async Task<IActionResult> GetUserStats(Guid id)
        {
            if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
            {
                return Unauthorized();
            }
            if (userId != id) return Forbid();

            var stats = await _userRepo.GetUserStatsAsync(id);
            return Ok(stats);
        }

        // PUT /api/users/{id}
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateUser(Guid id, UpdateUserDto dto)
        {
            if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
            {
                return Unauthorized();
            }
            if (userId != id) return Forbid();

            var user = await _userRepo.GetByIdAsync(id);
            if (user == null) return NotFound();

            if (!string.IsNullOrEmpty(dto.Name))
                user.Name = dto.Name;

            if (!string.IsNullOrEmpty(dto.Email))
            {
                var existing = await _userRepo.GetByEmailAsync(dto.Email);
                if (existing != null && existing.Id != id)
                    return BadRequest("Email already in use.");
                user.Email = dto.Email;
            }

            if (!string.IsNullOrEmpty(dto.NewPassword))
            {
                if (string.IsNullOrEmpty(dto.CurrentPassword))
                    return BadRequest("Current password is required.");
                if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
                    return BadRequest("Current password is incorrect.");
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            }

            await _userRepo.UpdateAsync(user);
            return Ok(new { user.Id, user.Name, user.Email });
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