using backend.Database;
using backend.Models;
using backend.Persistence.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Persistence.Repositories
{
    public class CommentRepository : ICommentRepository
    {
        private readonly AppDbContext _context;
        public CommentRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddCommentAsync(Comment comment)
        {
            await _context.Comments.AddAsync(comment);
            await _context.SaveChangesAsync();
        }

        public async Task<List<Comment>> GetEventCommentsAsync(Guid eventId)
        {
            return await _context.Comments
                .Where(c => c.EventId == eventId)
                .ToListAsync();
        }
        public async Task<List<Comment>> GetEventCommentsWithUsersAsync(Guid eventId)
        {
            return await _context.Comments
                .Where(o => o.EventId == eventId)
                .Include(c => c.User)
                .ToListAsync();
        }

        public async Task<bool> HasEventComment(Guid eventId)
        {
            return await _context.Comments
                    .AnyAsync(c => c.EventId == eventId);
        }

        public async Task<Comment?> GetCommentAsync(Guid id, Guid eventId)
        {
            return await _context.Comments
                .FirstOrDefaultAsync(c => c.Id == id && c.EventId == eventId);
        }

        public async Task DeleteAsync(Comment comment)
        {
            _context.Comments.Remove(comment);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Comment comment)
        {
            _context.Comments.Update(comment);
            await _context.SaveChangesAsync();
        }
    }
}