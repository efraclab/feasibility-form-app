namespace FeasibilityFormApp.Models
{
    public class WorkflowTrackerResponse
    {
        public long BatchId { get; set; }
        public string? CurrentStage { get; set; }
        public string? WorkflowStatus { get; set; }
        public string? LastActionBy { get; set; }
        public DateTime? LastActionAt { get; set; }
        public string? WorkflowRemarks { get; set; }
        public List<WorkflowTrackerItem> History { get; set; } = new();
    }

    public class WorkflowTrackerItem
    {
        public string Stage { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? UserId { get; set; }
        public string? UserName { get; set; }
        public DateTime? ActionAt { get; set; }
        public string? Change { get; set; }
        public string? Remarks { get; set; }
    }
}
