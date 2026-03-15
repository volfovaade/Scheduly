using backend.Models;
using backend.Database;
using backend.Persistence.Interfaces;
using Microsoft.EntityFrameworkCore;
using backend.DTOs;

namespace backend.Persistence.Repositories
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

        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
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
        public async Task UpdateAsync(User u)
        {
            _context.Users.Update(u);
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
        public async Task<UserStatsDto> GetUserStatsAsync(Guid userId)
        {
            var organized = await _context.Events
                .Where(e => e.OwnerId == userId)
                .ToListAsync();

            var participating = await _context.EventParticipants
                .Include(p => p.Event)
                .Where(p => p.UserId == userId && p.Event.OwnerId != userId)
                .Select(p => p.Event)
                .ToListAsync();

            return new UserStatsDto
            {
                OrganizedTotal = organized.Count,
                OrganizedActive = organized.Count(e => e.Phase != EventPhase.Closed),
                ParticipatingTotal = participating.Count,
                ParticipatingActive = participating.Count(e => e.Phase != EventPhase.Closed),
                ClosedEvents = organized.Count(e => e.Phase == EventPhase.Closed)
                             + participating.Count(e => e.Phase == EventPhase.Closed)
            };
        }
        }
}