using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public enum VoteType
    {
        Preference,    // normal preference voting 1-5
        Final,         // final voting (yes or no)
        Attendance     // the participation acceptance
    }
    /// <summary>
    /// User's vote on a specific event option during the voting phase.
    /// Contains a numerical score indicating preference strength.
    /// </summary>
    public class Vote
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;

        public Guid OptionId { get; set; }
        public EventOption Option { get; set; } = null!;

        [Required]
        public VoteType Type { get; set; }
        [Range(-1, 10)]
        public int Score { get; set; }  // voting score (higher = more preferred)
        public DateTimeOffset VotedAt { get; set; } = DateTimeOffset.UtcNow;  // zatím nepoužíváno

    }
}
