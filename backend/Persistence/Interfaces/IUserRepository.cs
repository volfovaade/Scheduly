using backend.DTOs;
using backend.Models;

namespace backend.Persistence.Interfaces
{
    public interface IUserRepository
    {
        Task<User?> GetByIdAsync(Guid id);
        Task<User?> GetByEmailAsync(string email);
        Task<List<User>> GetSuspiciousUsersAsync();
        Task<bool> Contains(string email);
        Task AddAsync(User user);
        Task UpdateAsync(User user);
        Task UpdatePassword(string email, string newPassword);
        Task<User?> GetUserWithRole(string email);
        Task<int> GetNumberOfUsersEvents(Guid userId);
        Task<UserStatsDto> GetUserStatsAsync(Guid userId);
    }
}