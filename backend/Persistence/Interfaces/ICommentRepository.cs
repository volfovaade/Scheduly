using backend.DTOs;
using backend.Models;

namespace backend.Repositories.Interfaces
{
    public interface ICommentRepository
    {
        Task AddCommentAsync(Comment comment);
        Task<List<Comment>> GetEventCommentsAsync(Guid eventId);
        Task<bool> HasEventComment(Guid eventId);
        Task<Comment?> GetCommentAsync(Guid id, Guid eventId);
        Task<List<Comment>> GetEventCommentsWithUsersAsync(Guid eventId);
        Task DeleteAsync(Comment comment);
        Task UpdateAsync(Comment comment);
    }
}