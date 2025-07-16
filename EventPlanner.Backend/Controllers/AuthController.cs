using EventPlanner.Backend.Database;
using EventPlanner.Backend.DTOs;
using EventPlanner.Backend.Models;
using EventPlanner.Backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;

namespace EventPlanner.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ITokenService _tokenService;

        public AuthController(AppDbContext context, ITokenService tokenService)
        {
            _context = context;
            _tokenService = tokenService;
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register(AuthRequest request)
        {
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                return BadRequest("User already exists");

            var role = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "User");
            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = request.Email,
                Name = request.Email.Split('@')[0],
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                RoleId = role.Id
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return new AuthResponse
            {
                Token = _tokenService.CreateToken(user),
                Name = user.Name,
                Role = role.Name
            };
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login(AuthRequest request)
        {
            var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                return Unauthorized("Invalid credentials");

            return new AuthResponse
            {
                Token = _tokenService.CreateToken(user),
                Name = user.Name,
                Role = user.Role.Name
            };
        }
    }
}
