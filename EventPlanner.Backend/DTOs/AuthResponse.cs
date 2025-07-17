namespace EventPlanner.Backend.DTOs
{
    public class AuthResponse
    {
        public required string Token { get; set; }
        public required string Name { get; set; }
        public string? Role { get; set; }
    }
}
