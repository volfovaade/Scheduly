namespace backend.Models
{
    /// <summary>
    /// Represents a user's final vote on generated place options.
    /// Used in the final voting phase after place options are generated
    /// </summary>
    public class FinalVote
    {
        public Guid Id { get; set; }
        public Guid EventId { get; set; }
        public Guid UserId { get; set; }
        public Guid OptionId { get; set; } // references GeneratedPlaceOption
    }
}