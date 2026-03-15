using backend.Database;
using backend.DTOs;
using backend.Models;
using backend.Persistence.Interfaces;
using backend.Services;
using backend.Services.Interfaces;
using BCrypt.Net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IUserRepository _userRepo;
        private readonly IRoleRepository _roleRepo;
        private readonly IEmailService _emailService;
        private readonly IPasswordResetTokenRepository _passwordRepo;
        private readonly ITokenService _tokenService;

        public AuthController(
            IUserRepository userRepo, IRoleRepository roleRepo,
            IPasswordResetTokenRepository passwordRepo, ITokenService tokenService,
            IEmailService emailService
            )
        {
            _userRepo = userRepo;
            _roleRepo = roleRepo;
            _passwordRepo = passwordRepo;
            _tokenService = tokenService;
            _emailService = emailService;
        }

        // POST: api/auth/register
        // Registers a new user, hashes the password, assigns default "User" role, and returns a JWT token.
        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
        {
            bool alreadyTaken = await _userRepo.Contains(request.Email);
            if (alreadyTaken)
                return BadRequest("User already exists");

            Role? role = await _roleRepo.GetAsync("User");
            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = request.Email,
                Name = request.Name,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Role = role!
            };
            await _userRepo.AddAsync(user);

            await _emailService.SendRegistrationConfirmationAsync(user.Email, user.Name);

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
        public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
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

        // Forgot password for user
        // POST: api/auth/forgotPassword
        [HttpPost("forgotPassword")]
        [AllowAnonymous]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
        {
            var user = await _userRepo.GetByEmailAsync(dto.Email);
            if (user == null) return Ok();  //Ok because we do not want to say if email exists

            var oldTokens = await _passwordRepo.GetOldTokensByUserIdAsync(user.Id);
            await _passwordRepo.DeleteAsync(oldTokens);

            var token = Guid.NewGuid().ToString("N");
            await _passwordRepo.AddAsync(new PasswordResetToken
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                Token = token,
                ExpiresAt = DateTimeOffset.UtcNow.AddHours(1),
                Used = false
            });
            await _emailService.SendPasswordResetAsync(user.Email, user.Name, token);
            return Ok();
        }
        // Reset users password if needed
        // POST: api/auth/resetPassword
        [HttpPost("resetPassword")]
        [AllowAnonymous]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
        {
            var resetToken = await _passwordRepo.GetResetTokenWithUser(dto);

            if (resetToken == null)
                return BadRequest("Invalid or expired token");

            resetToken.User.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            resetToken.Used = true;

            await _passwordRepo.UpdateAsync(resetToken);
            return Ok();
        }
    }
}
