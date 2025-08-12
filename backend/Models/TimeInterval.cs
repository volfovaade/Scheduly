namespace backend.Models
{
    /// <summary>
    /// Time slot when a user is available for an event.
    /// Part of a user's place preference.
    /// </summary>
    public class TimeInterval
    {
        public Guid Id { get; set; }

        public Guid PlacePreferenceId { get; set; }  // foreign key to PlacePreference

        public DateTime From { get; set; }
        public DateTime To { get; set; }
    }
}