using EventPlanner.Backend.Database;
using EventPlanner.Backend.DTOs;
using EventPlanner.Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace EventPlanner.Backend.Controllers
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
                    VoteCount = o.Votes.Count
                })
                .ToListAsync();

            return Ok(summary);
        }
    }
}