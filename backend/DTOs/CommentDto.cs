namespace backend.DTOs
{
    public class CommentDto
    {
        public Guid Id { get; set; }
        public Guid EventId { get; set; }
        public Guid UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsEdited { get; set; }
        public bool CanEdit { get; set; } // true if current user is author
        public bool CanDelete { get; set; } // true if current user is author or organizer
    }
    public class CommentCreateDto
    {
        public required string Content { get; set; }
    }

    public class CommentUpdateDto
    {
        public required string Content { get; set; }
    }
}