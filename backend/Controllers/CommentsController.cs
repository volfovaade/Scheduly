using backend.Database;
using backend.DTOs;
using backend.Models;
using backend.Repositories.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Xml.Linq;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/events/{eventId}/comments")]
    [Authorize]
    public class CommentsController : ControllerBase
    {
        private readonly ICommentRepository _commentRepo;
        private readonly IEventRepository _eventRepo;
        private readonly IUserRepository _userRepo;
        public CommentsController(IUserRepository userRepo, IEventRepository eventRepo, ICommentRepository commentRepo)
        {
            _commentRepo = commentRepo;
            _eventRepo = eventRepo;
            _userRepo = userRepo;
        }
        // GET: api/events/{eventId}/comments
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CommentDto>>> GetComments(Guid eventId)
        {
            if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var currentUserId))
            {
                return Unauthorized();
            }
            var ev = await _eventRepo.GetByIdWithParticipantsAsync(eventId);
            if (ev == null) return NotFound("Event wasn't found");

            var isOrganizer = ev.Participants.Any(p =>
                p.UserId == currentUserId && p.Role == EventRoles.Organizator);

            var com = await _commentRepo.GetEventCommentsWithUsersAsync(eventId);

            var orderedComments = com.OrderBy(c => c.CreatedAt)
                .Select(c => new CommentDto
                {
                    Id = c.Id,
                    EventId = c.EventId,
                    UserId = c.UserId,
                    UserName = c.User.Name,
                    Content = c.Content,
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt,
                    IsEdited = c.UpdatedAt.HasValue,
                    CanEdit = c.UserId == currentUserId,
                    CanDelete = c.UserId == currentUserId || isOrganizer
                })
                .ToList();

            return Ok(orderedComments);
        }

        // POST: api/events/{eventId}/comments
        [HttpPost]
        public async Task<ActionResult<CommentDto>> CreateComment(Guid eventId, [FromBody] CommentCreateDto dto)
        {
            if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
                return Unauthorized();

            var ev = await _eventRepo.GetByIdWithParticipantsAsync(eventId);
            if (ev == null) return NotFound("Event wasn't found");

            // validate content if not empty or too long
            if (string.IsNullOrWhiteSpace(dto.Content))
                return BadRequest("Comment content cannot be empty");

            if (dto.Content.Length > 2000)
                return BadRequest("Comment is too long (max 2000 characters)");

            var comment = new Comment
            {
                Id = Guid.NewGuid(),
                EventId = eventId,
                UserId = userId,
                Content = dto.Content.Trim(),
                CreatedAt = DateTimeOffset.UtcNow
            };

            await _commentRepo.AddCommentAsync(comment);

            // loading user for response
            var user = await _userRepo.GetByIdAsync(userId);
            return CreatedAtAction(nameof(GetComments), new { eventId }, new CommentDto
            {
                Id = comment.Id,
                EventId = comment.EventId,
                UserId = comment.UserId,
                UserName = user?.Name ?? "Unknown",
                Content = comment.Content,
                CreatedAt = comment.CreatedAt,
                UpdatedAt = comment.UpdatedAt,
                IsEdited = false,
                CanEdit = true,
                CanDelete = true
            });

        }
        // PUT: api/events/{eventId}/comments/{commentId}
        [HttpPut("{commentId}")]
        public async Task<IActionResult> UpdateComment(Guid eventId, Guid commentId, [FromBody] CommentUpdateDto dto)
        {
            if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
                return Unauthorized();

            var comment = await _commentRepo.GetCommentAsync(commentId, eventId);

            if (comment == null)
                return NotFound("Comment wasn't found");

            // only author can edit
            if (comment.UserId != userId)
                return Forbid("You can only edit your own comments");
            // validate content if ot empty or too long
            if (string.IsNullOrWhiteSpace(dto.Content))
                return BadRequest("Comment content cannot be empty");

            if (dto.Content.Length > 2000)
                return BadRequest("Comment is too long (max 2000 characters)");

            comment.Content = dto.Content.Trim();
            comment.UpdatedAt = DateTimeOffset.UtcNow;
            await _commentRepo.UpdateAsync(comment);

            return Ok(new { message = "Comment updated successfully" });
        }

        // DELETE: api/events/{eventId}/comments/{commentId}
        [HttpDelete("{commentId}")]
        public async Task<IActionResult> DeleteComment(Guid eventId, Guid commentId)
        {
            if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
                return Unauthorized();

            var comment = await _commentRepo.GetCommentAsync(commentId, eventId);
            if (comment == null)
                return NotFound("Comment wasn't found");

            var eventWithParticipants = await _eventRepo.GetByIdWithParticipantsAsync(eventId);
            if (eventWithParticipants == null) 
                return NotFound("Event wasn't found");

            var isOrganizer = eventWithParticipants.Participants
                .Any(p => p.EventId == eventId
                    && p.UserId == userId
                    && p.Role == EventRoles.Organizator);

            if (comment.UserId != userId && !isOrganizer)
                return Forbid("You can only delete your own comments or you must be an organizer");

            await _commentRepo.DeleteAsync(comment);
            return Ok(new { message = "Comment deleted successfully" });
        }
        // GET: api/events/{eventId}/comments/count
        [HttpGet("count")]
        public async Task<ActionResult<int>> GetCommentCount(Guid eventId)
        {
            var comments = await _commentRepo.GetEventCommentsAsync(eventId);
            return Ok(comments.Count);
        }
    }
}