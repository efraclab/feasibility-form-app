using System.ComponentModel.DataAnnotations;

namespace FeasibilityFormApp.Models
{
    public class LogInRequest
    {
        [Required]
        public string EmployeeId { get; set; }

        [Required]
        public string Password { get; set; }
    }
}
