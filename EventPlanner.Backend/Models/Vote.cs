namespace EventPlanner.Backend.Models
{
    public class Vote
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;

        public Guid OptionId { get; set; }
        public EventOption Option { get; set; } = null!;
        public int Score { get; set; }
    }
}
