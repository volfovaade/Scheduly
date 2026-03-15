using backend.DTOs;
using backend.Models;

namespace backend.Persistence.Interfaces
{
    public interface IPasswordResetTokenRepository
    {
        Task<List<PasswordResetToken>> GetOldTokensByUserIdAsync(Guid userId);
        Task DeleteAsync(List<PasswordResetToken> tokens);
        Task AddAsync(PasswordResetToken newToken);
        Task<PasswordResetToken?> GetResetTokenWithUser(ResetPasswordDto dto);
        Task UpdateAsync(PasswordResetToken token);
    }
}