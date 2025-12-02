using backend.Models;

namespace backend.Repositories.Interfaces
{
    public interface ILocationPrefRepository
    {
        Task AddAsync(LocationPreference pref);
        Task<List<LocationPreference>> GetAllAsync(Guid eventId, Guid userId);
        Task<LocationPreference?> GetAsync(Guid eventId, Guid userId);
        Task DeleteAsync(LocationPreference pref);
    }
}