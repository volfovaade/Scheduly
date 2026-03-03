using backend.Models;

namespace backend.Persistence.Interfaces
{
    public interface IRoleRepository
    {
        Task<Role?> GetAsync(string roleName);
    }
}
