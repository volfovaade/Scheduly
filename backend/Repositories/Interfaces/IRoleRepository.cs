using backend.Models;

namespace backend.Repositories.Interfaces
{
    public interface IRoleRepository
    {
        Task<Role> GetRoleAsync(string roleName);
    }
}
