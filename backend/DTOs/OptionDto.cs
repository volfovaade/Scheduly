using backend.Models;

namespace backend.DTOs
{
    // for response
    public class OptionDto
    {
        public Guid Id { get; set; }
        public string PlaceName { get; set; } = string.Empty;
        public string? Address { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public DateTime TimeFrom { get; set; } 
        public DateTime TimeTo { get; set; }
        public OptionSource Source { get; set; }
        public Guid? CreatedByUserId { get; set; }
        public bool IsSelected { get; set; }
        public int VoteCount { get; set; }
        public int TotalScore { get; set; }
    }
}