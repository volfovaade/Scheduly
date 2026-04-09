using backend.Models;

namespace backend.Persistence.Interfaces
{
    public interface IEventRepository
    {
        Task<IEnumerable<Event>> GetAllAsync();
        Task<Event?> GetByIdAsync(Guid id);
        Task<List<Event>> GetByOwnerIdAsync(Guid ownerId);
        Task<List<Event>> GetOldEventsAsync(DateTimeOffset oldDate);
        Task<Event?> GetByIdWithParticipantsAsync(Guid id); // special method with Include
        Task<List<Event>> GetByUserParticipation(Guid userId);
        Task<bool> HasCodeAsync(string code);
        Task<Event?> GetByCodeAsync(string code);
        Task AddAsync(Event entity);
        Task DeleteAsync(Event entity);
        Task DeleteAsync(List<Event> entities);
        Task UpdateAsync(Event e);

        // for finalization - loading preferences
        Task<List<LocationPreference>> GetLocationPreferencesAsync(Guid eventId);
        Task<List<TimePreference>> GetTimePreferencesAsync(Guid eventId);
        Task<List<TimePreference>> GetTimePreferencesWithIntervalsAsync(Guid eventId);
    }
}
