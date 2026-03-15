namespace backend.DTOs
{
    public class UserStatsDto
    {
        public int OrganizedTotal { get; set; }
        public int OrganizedActive { get; set; }
        public int ParticipatingTotal { get; set; }
        public int ParticipatingActive { get; set; }
        public int ClosedEvents { get; set; }
    }
}