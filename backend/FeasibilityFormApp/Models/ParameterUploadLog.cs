namespace FeasibilityFormApp.Models
{
    public class ParameterUploadLog
    {
        public long Id { get; set; }
        public long BatchId { get; set; }
        public string FileName { get; set; }
        public int TotalRows { get; set; }
        public int SuccessfulRows { get; set; }
        public int FailedRows { get; set; }
        public string UploadedBy { get; set; }
        public DateTime UploadedAt { get; set; }
        public string Status { get; set; }
        public string ErrorMessage { get; set; }

        public string? CurrentStage { get; set; }
        public string? WorkflowStatus { get; set; }
        public string? LastActionBy { get; set; }
        public DateTime? LastActionAt { get; set; }
        public string? WorkflowRemarks { get; set; }
    }
}