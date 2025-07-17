namespace EventPlanner.Backend.DTOs
{
    public class VoteRequestDto
    {
        public List<Guid> OptionIds { get; set; } = new();
    }
}