using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class VoteRequestDto
    {
        [Required]
        public List<VoteItem> Votes { get; set; } = new();
    }

    public class VoteItem
    {
        [Required]
        public Guid OptionId { get; set; }
        public int Score { get; set; } = 1; // 1-5 for preferences
    }
}