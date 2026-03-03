using backend.Database;
using backend.DTOs;
using backend.Models;
using backend.Persistence.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Persistence.Repositories
{
    public class PasswordResetTokenRepository : IPasswordResetTokenRepository
    {
        private readonly AppDbContext _context;
        public PasswordResetTokenRepository(AppDbContext context) 
        {
            _context = context;
        }
        public async Task DeleteAsync(List<PasswordResetToken> tokens)
        {
            _context.PasswordResetTokens.RemoveRange(tokens);
            await _context.SaveChangesAsync();
        }

        public async Task<List<PasswordResetToken>> GetOldTokensByUserIdAsync(Guid userId)
        {
            return await _context.PasswordResetTokens
                .Where(t => t.UserId == userId && t.Used)
                .ToListAsync();
        }
        public async Task AddAsync(PasswordResetToken token)
        {
            await _context.PasswordResetTokens.AddAsync(token);
            await _context.SaveChangesAsync();
        }
        public async Task<PasswordResetToken> GetResetTokenWithUser(ResetPasswordDto dto)
        {
            return await _context.PasswordResetTokens
                .Include(t => t.User)
                .FirstOrDefaultAsync(t =>
                    t.Token == dto.Token &&
                    !t.Used &&
                    t.ExpiresAt > DateTimeOffset.UtcNow);
        }
        public async Task UpdateAsync(PasswordResetToken token)
        {
            _context.PasswordResetTokens.Update(token);
            await _context.SaveChangesAsync();
        }
    }
}