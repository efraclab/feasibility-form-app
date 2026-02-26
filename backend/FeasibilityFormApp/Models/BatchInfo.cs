namespace FeasibilityFormApp.Models
{
    public class BatchInfo
    {
        public long BatchId { get; set; }

        public string? UploadedBy { get; set; }

        public int RecordCount { get; set; }

        public string? FirstParameterName { get; set; }

        public DateTime? UploadDate { get; set; }
    }
}
