namespace backend.Models
{
    public class TimeInterval
    {
        public Guid Id { get; set; }

        public Guid PlacePreferenceId { get; set; }

        public DateTime From { get; set; }
        public DateTime To { get; set; }
    }
}