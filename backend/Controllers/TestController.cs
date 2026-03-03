#if DEBUG  // pouze v development buildu
using backend.Services;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/test")]
    public class TestController : ControllerBase
    {
        private readonly IEmailService _emailService;

        public TestController(IEmailService emailService)
        {
            _emailService = emailService;
        }

        [HttpGet("email/registration")]
        public async Task<IActionResult> TestRegistration()
        {
            await _emailService.SendRegistrationConfirmationAsync("volfova.adela133@gmail.com", "Test User");
            return Ok("Registration email sent!");
        }

        [HttpGet("email/reset")]
        public async Task<IActionResult> TestPasswordReset()
        {
            await _emailService.SendPasswordResetAsync("volfova.adela133@gmail.com", "Test User", "fake-token-123");
            return Ok("Password reset email sent!");
        }

        [HttpGet("email/closed")]
        public async Task<IActionResult> TestEventClosed()
        {
            await _emailService.SendEventClosedAsync(
                "volfova.adela133@gmail.com", "Test User",
                "Weekend Trip",
                "Café Na Rohu", "Karlovo námìstí 5, Praha",
                DateTimeOffset.UtcNow.AddDays(3),
                DateTimeOffset.UtcNow.AddDays(3).AddHours(2)
            );
            return Ok("Event closed email sent!");
        }

        [HttpGet("email/reminder")]
        public async Task<IActionResult> TestReminder()
        {
            await _emailService.SendDeadlineReminderAsync(
                "volfova.adela133@gmail.com", "Test User",
                "Weekend Trip",
                DateTimeOffset.UtcNow.AddHours(24)
            );
            return Ok("Reminder email sent!");
        }

        [HttpGet("email/invitation")]
        public async Task<IActionResult> TestInvitation()
        {
            await _emailService.SendEventInvitationAsync(
                "volfova.adela133@gmail.com", "Test User",
                "Weekend Trip", "ABC123", "Organizer Name"
            );
            return Ok("Invitation email sent!");
        }

        [HttpGet("email/cancelled")]
        public async Task<IActionResult> TestCancelled()
        {
            await _emailService.SendEventCancelledAsync(
                "volfova.adela133@gmail.com", "Test User", "Weekend Trip"
            );
            return Ok("Cancellation email sent!");
        }
    }
}
#endif