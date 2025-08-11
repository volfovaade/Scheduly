using backend.Database;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/events/{eventId}/votes")]
    [Authorize]
    public class VotesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public VotesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> SubmitVotes(Guid eventId, VoteRequestDto voteDto)
        {
            // gets the id of current logged user from JWT token
            if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
            {
                return Unauthorized("Invalid user ID in token.");
            }

            var userVotes = await _context.Votes
                .Where(v => v.Option.EventId == eventId && v.UserId == userId)
                .ToListAsync();

            _context.Votes.RemoveRange(userVotes); // rewrite of votes

            foreach (var optionId in voteDto.OptionIds)
            {
                _context.Votes.Add(new Vote
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    OptionId = optionId
                });
            }

            await _context.SaveChangesAsync();
            return Ok("Votes submitted");
        }

        [HttpPost("final")]
        public async Task<IActionResult> VoteFinal(Guid eventId, [FromBody] Guid optionId)
        {
            if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
            {
                return Unauthorized();
            }
            // removing previous if exists
            var existingVote = await _context.FinalVotes
                .FirstOrDefaultAsync(v => v.Id == eventId &&  v.UserId == userId);
            if (existingVote != null) _context.FinalVotes.Remove(existingVote);

            // save new vote
            var vote = new FinalVote
            {
                Id = Guid.NewGuid(),
                EventId = eventId,
                UserId = userId,
                OptionId = optionId
            };
            _context.FinalVotes.Add(vote);
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetVoteSummary(Guid eventId)
        {
            var summary = await _context.EventOptions
                .Where(o => o.EventId == eventId)
                .Select(o => new
                {
                    o.Id,
                    o.TimeFrom,
                    o.TimeTo,
                    o.Location,
                    VoteCount = o.Votes.Count,
                    TotalScore = _context.Votes
                        .Where(v => v.OptionId == o.Id)
                        .Sum(v => (int?)v.Score) ?? 0
                })
                .ToListAsync();

            return Ok(summary);
        }
    }
}