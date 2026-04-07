using backend.Models;

namespace backend.Persistence.Interfaces
{
    public interface IEventOptionRepository
    {
        Task AddOptionsAsync(List<EventOption> options);
        Task AddOptionAsync(EventOption option);
        Task<List<EventOption>> GetOptionsAsync(Guid eventId);
        Task<List<EventOption>> GetOptionsWithVotesAsync(Guid eventId);
        Task<bool> HasEventOption(Guid eventId, Guid optionId);
        Task<EventOption?> GetOptionWithVotesAsync(Guid eventId, Guid optionId);
        Task DeleteAsync(EventOption option);
        Task UpdateAsync(EventOption option);
    }
}