using backend.Models;

namespace backend.Repositories.Interfaces
{
    public interface IUserRepository
    {
        Task<User?> GetByIdAsync(Guid id);
        Task<List<User>> GetSuspiciousUsersAsync();
        Task<bool> Contains(string email);
        Task AddAsync(User user);
        Task<User?> GetUserWithRole(string email);
    }
}