using backend.Models;

namespace backend.Persistence.Interfaces
{
    public interface IEventParticipantRepository
    {
        Task AddEventParticipantAsync(EventParticipant participant);
        Task DeleteEventParticipantAsync(EventParticipant participant);
        Task<List<EventParticipant>> GetEventParticipantsWithUser(Guid eventId);
        Task<EventParticipant?> GetParticipantAsync(Guid eventId, Guid userId);
    }
}