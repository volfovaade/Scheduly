using backend.Database;
using backend.DTOs;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;
using backend.Repositories.Interfaces;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IUserRepository _userRepo;
        private readonly IRoleRepository _roleRepo;
        private readonly ITokenService _tokenService;

        public AuthController(IUserRepository userRepo, IRoleRepository roleRepo, ITokenService tokenService)
        {
            _userRepo = userRepo;
            _roleRepo = roleRepo;
            _tokenService = tokenService;
        }

        // POST: api/auth/register
        // Registers a new user, hashes the password, assigns default "User" role, and returns a JWT token.
        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register(AuthRequest request)
        {
            bool alreadyTaken = await _userRepo.Contains(request.Email);
            if (alreadyTaken)
                return BadRequest("User already exists");

            Role? role = await _roleRepo.GetRoleAsync("User");
            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = request.Email,
                Name = request.Email.Split('@')[0],
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Role = role!
            };
            await _userRepo.AddAsync(user);

            return new AuthResponse
            {
                Token = _tokenService.CreateToken(user),
                Name = user.Name,
                Role = role?.Name,
                UserId = user.Id
            };
        }

        // POST: api/auth/login
        // Authenticates a user by email/password, returns JWT token on success.
        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login(AuthRequest request)
        {
            var user = await _userRepo.GetUserWithRole(request.Email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                return Unauthorized("Invalid credentials");

            return new AuthResponse
            {
                Token = _tokenService.CreateToken(user),
                Name = user.Name,
                Role = user.Role?.Name,
                UserId = user.Id
            };
        }
    }
}
