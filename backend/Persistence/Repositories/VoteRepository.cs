using backend.Models;
using backend.Database;
using backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Persistence.Repositories
{
    public class VoteRepository : IVoteRepository
    {
        private readonly AppDbContext _context;
        public VoteRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task DeleteExistingBy(Guid userId, Guid eventId, VoteType voteType)
        {
            var existingVotes = await _context.Votes
                .Where(v => v.Option.EventId == eventId
                    && v.UserId == userId
                    && v.Type == voteType)
                .ToListAsync();

            _context.Votes.RemoveRange(existingVotes); // for future rewrite of votes
            await _context.SaveChangesAsync();
        }
        public async Task AddAsync(Vote vote)
        {
            await _context.Votes.AddAsync(vote);
            await _context.SaveChangesAsync();
        }
        public async Task<List<Vote>> GetUserVotes(Guid eventId, Guid userId)
        {
            return await _context.Votes
                .Where(v => v.Option.EventId == eventId && v.UserId == userId)
                .ToListAsync();
        }
        public async Task DeleteUserVotesAsync(Guid eventId, Guid userId)
        {
            var votes = await GetUserVotes(eventId, userId);
            if (votes.Count != 0)
            {
                _context.Votes.RemoveRange(votes);
            }
            await _context.SaveChangesAsync();
        }
        public async Task<EventOption?> GetWinningOptionAsync(Guid eventId, VoteType voteType)
        {
            return await _context.Votes
                .Where(v => v.Option.EventId == eventId && v.Type == voteType)
                .GroupBy(v => v.OptionId)
                .Select(g => new {
                    OptionId = g.Key,
                    Count = g.Count(),
                    TotalScore = g.Sum(v => v.Score)
                })
                .OrderByDescending(g => g.TotalScore)
                .ThenByDescending(g => g.Count)
                .Join(_context.EventOptions,
                    g => g.OptionId,
                    o => o.Id,
                    (g, o) => o)
                .FirstOrDefaultAsync();
        }
    }
}