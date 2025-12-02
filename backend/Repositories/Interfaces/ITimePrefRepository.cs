using backend.Models;

namespace backend.Repositories.Interfaces
{
    public interface ITimePrefRepository
    {
        Task AddAsync(TimePreference option);
        Task<List<TimePreference>> GetAllAsync(Guid eventId, Guid userId);
        Task<TimePreference?> GetWithIntervalsAsync(Guid eventId, Guid userId);
        Task DeleteWithIntervalsAsync(TimePreference pref);
    }
}