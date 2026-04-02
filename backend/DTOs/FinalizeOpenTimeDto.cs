using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class FinalizeOpenTimeDto
    {
        [Range(1, 1440)]
        public int Duration { get; set; }
    }
}