using backend.Models;

namespace backend.Repositories.Interfaces
{
    public interface IEventParticipantRepository
    {
        Task AddEventParticipantAsync(EventParticipant participant);
        Task DeleteEventParticipantAsync(EventParticipant participant);
        Task<List<EventParticipant>> GetEventParticipantsWithUsername(Guid eventId);
        Task<EventParticipant?> GetParticipantAsync(Guid eventId, Guid userId);
    }
}