namespace backend.DTOs
{
    public class VoteRequestDto
    {
        public List<VoteItem> Votes { get; set; } = new();
    }

    public class VoteItem
    {
        public Guid OptionId { get; set; }
        public int Score { get; set; } = 1; // 1-5 for preferences
    }
}