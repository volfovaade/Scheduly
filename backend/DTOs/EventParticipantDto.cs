namespace backend.DTOs
{
    public class EventParticipantDto
    {
        public Guid UserId { get; set; }
        public string Role { get; set; } = null!;
        public UserDto User { get; set; } = null!;
    }
}