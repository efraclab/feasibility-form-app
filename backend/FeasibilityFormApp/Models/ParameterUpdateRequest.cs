namespace FeasibilityFormApp.Models
{
    public class ParameterUpdateRequest
    {
        public List<ParameterMaster> Parameters { get; set; }
        public bool? Success { get; set; }
        public long? BatchId { get; set; }
        public string? Remarks { get; set; }
        public string? UpdatedBy { get; set; }
        public string? ReviewedBy { get; set; }
    }
}
