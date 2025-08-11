namespace backend.Models
{
    public class FinalVote
    {
        public Guid Id { get; set; }
        public Guid EventId { get; set; }
        public Guid UserId { get; set; }
        public Guid OptionId { get; set; }
    }
}