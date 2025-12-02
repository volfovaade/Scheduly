using backend.Database;
using backend.DTOs;
using backend.Models;
using backend.Repositories.Interfaces;
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
        private readonly IEventRepository _eventRepo;
        private readonly IVoteRepository _voteRepo;
        private readonly IEventOptionRepository _eventOptionRepo;

        public VotesController(IEventRepository eventRepo, IVoteRepository voteRepo, IEventOptionRepository eventOptionRepo)
        {
            _eventRepo = eventRepo;
            _voteRepo = voteRepo;
            _eventOptionRepo = eventOptionRepo;
        }

        // POST: api/events/{eventId}/votes
        // Submits a list of votes for event options.
        // Unified voting endpoint for all phases
        [HttpPost]
        public async Task<IActionResult> SubmitVotes(Guid eventId, VoteRequestDto voteDto)
        {
            // gets the id of current logged user from JWT token
            if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
            {
                return Unauthorized("Invalid user ID in token.");
            }

            var ev = await _eventRepo.GetByIdAsync(eventId);
            if (ev == null) return NotFound("Event not found");

            // determine vote type based on phase
            var voteType = ev.Phase == EventPhase.FinalVoting
                ? VoteType.Final
                : VoteType.Preference;

            await _voteRepo.DeleteExistingBy(userId, eventId, voteType); // for future rewrite of votes

            // add new votes
            foreach (var voteItem in voteDto.Votes)
            {
                // validate option exists and belongs to this event
                var optionExists = await _eventOptionRepo.HasEventOption(eventId, voteItem.OptionId);

                if (!optionExists)
                    continue; // skip invalid options

                await _voteRepo.AddAsync(new Vote
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    OptionId = voteItem.OptionId,
                    Type = voteType,
                    Score = voteItem.Score
                });
            }

            return Ok("Votes submitted");
        }

        // GET: api/events/{eventId}/votes/my
        // Get user's votes for this event
        [HttpGet("my")]
        public async Task<IActionResult> GetMyVotes(Guid eventId)
        {
            if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
                return Unauthorized();

            var votes = (await _voteRepo.GetUserVotes(eventId, userId))
                                .Select(v => new
                                {
                                    v.Id,
                                    v.OptionId,
                                    v.Type,
                                    v.Score,
                                    v.VotedAt
                                });

            return Ok(votes);
        }

        // GET: api/events/{eventId}/votes/summary
        // Returns a summary of votes and scores for each event option.
        [HttpGet("summary")]
        public async Task<IActionResult> GetVoteSummary(Guid eventId)
        {
            var summary = (await _eventOptionRepo.GetOptionsAsync(eventId))
                .Select(o => new
                {
                    o.Id,
                    o.PlaceName,
                    o.TimeFrom,
                    o.TimeTo,
                    o.Address,
                    PreferenceVotes = o.Votes.Count(v => v.Type == VoteType.Preference),
                    PreferenceScore = o.Votes
                        .Where(v => v.Type == VoteType.Preference)
                        .Sum(v => (int?)v.Score) ?? 0,
                    FinalVotes = o.Votes.Count(v => v.Type == VoteType.Final),
                    FinalScore = o.Votes
                        .Where(v => v.Type == VoteType.Final)
                        .Sum(v => (int?)v.Score) ?? 0
                });

            return Ok(summary);
        }
    }
}