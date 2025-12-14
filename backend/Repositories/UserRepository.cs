using backend.Models;
using backend.Database;
using backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _context;
        public UserRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<User?> GetByIdAsync(Guid id)
        {
            return await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == id);
        }
        public async Task<List<User>> GetSuspiciousUsersAsync()
        {
            return await _context.Users
                .Where(u => u.Events.Count > 50)
                .ToListAsync();
        }
        public async Task<bool> Contains(string email)
        {
            return await _context.Users.AnyAsync(u => u.Email == email);
        }
        public async Task AddAsync(User user)
        {
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();
        }
        public async Task<User?> GetUserWithRole(string email)
        {
            return await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Email == email);
        }
        public async Task<int> GetNumberOfUsersEvents(Guid userId)
        {
            return await _context.Events
                .Where(e => e.OwnerId == userId)
                .CountAsync();
        }
        public async Task UpdatePassword(string email, string newPasswordHash)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user != null)
            {
                user.PasswordHash = newPasswordHash;
                await _context.SaveChangesAsync();
            }
        }
    }
}