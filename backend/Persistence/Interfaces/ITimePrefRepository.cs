using backend.DTOs;
using backend.Models;

namespace backend.Persistence.Interfaces
{
    public interface ITimePrefRepository
    {
        Task AddAsync(TimePreference option);
        Task<List<TimePreference>> GetAllAsync(Guid eventId, Guid userId);
        Task<List<DayPreference>> GetAllDayVotes(Guid eventId);
        Task<List<DateOnly>> GetDates(Guid eventId, Guid userId);
        Task AddDayPreference(Guid eventId, Guid userId, DateOnly date);
        Task RemoveOldVotes(Guid eventId, Guid userId);
        Task<TimePreference?> GetWithIntervalsAsync(Guid eventId, Guid userId);
        Task DeleteWithIntervalsAsync(TimePreference pref);
    }
}