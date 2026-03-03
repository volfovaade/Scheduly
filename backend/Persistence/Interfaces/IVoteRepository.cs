using backend.Models;

namespace backend.Persistence.Interfaces
{
    public interface IVoteRepository
    {
        Task DeleteExistingBy(Guid userId, Guid eventId, VoteType voteType);
        Task DeleteUserVotesAsync(Guid eventId, Guid userId);
        Task AddAsync(Vote vote);
        Task<List<Vote>> GetUserVotes(Guid eventId, Guid userId);
        Task<EventOption?> GetWinningOptionAsync(Guid eventId, VoteType voteType);
    }
}