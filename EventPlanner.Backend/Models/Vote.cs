namespace EventPlanner.Backend.Models
{
    public class Vote
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public Guid OptionId { get; set; }
        public int Score { get; set; }
    }
}
