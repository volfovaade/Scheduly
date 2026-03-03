using backend.DTOs;
using backend.Models;

namespace backend.Services.Interfaces
{
    /// <summary>
    /// Service interface for event management operations.
    /// </summary>
    public interface IEventService
    {
        Task<IEnumerable<EventDto>> GetAllAsync();
        Task<DetailedEventDto?> GetByIdAsync(Guid id, Guid currentUserId);
        Task<IEnumerable<EventDto>> GetUserEventsAsync(Guid userId);
        Task<EventDto> CreateAsync(Guid userId, EventCreateDto dto);
        Task<bool> DeleteAsync(Guid id, Guid userId);
        Task<List<EventOption>> FinalizeFullyOpen(Guid eventId, int? duration = 2, string? organizerTypeChoice = null);
        Task<List<EventOption>> FinalizeFixedTimeOpenPlace(Guid eventId, string? organizerTypeChoice = null);
        Task<DateTimeOffset> FinalizeFixedPlaceOpenTime(Event ev, int duration);

    }
}