using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class CommentDto
    {
        public Guid Id { get; set; }
        public Guid EventId { get; set; }
        public Guid UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }
        public bool IsEdited { get; set; }
        public bool CanEdit { get; set; } // true if current user is author
        public bool CanDelete { get; set; } // true if current user is author or organizer
    }
    public class CommentCreateDto
    {
        [Required, StringLength(2000, MinimumLength = 1)]
        public required string Content { get; set; }
    }

    public class CommentUpdateDto
    {
        [Required, StringLength(2000, MinimumLength = 1)]
        public required string Content { get; set; }
    }
}