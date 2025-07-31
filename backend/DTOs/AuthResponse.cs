namespace backend.DTOs
{
    public class AuthResponse
    {
        public required string Token { get; set; }
        public required string Name { get; set; }
        public string? Role { get; set; }
        public Guid UserId { get; set; }
    }
}
