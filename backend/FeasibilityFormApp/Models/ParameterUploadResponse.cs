namespace FeasibilityFormApp.Models
{
    public class ParameterUploadResponse
    {
        public long UploadLogId { get; set; }
        public int TotalRows { get; set; }
        public int SuccessfulRows { get; set; }
        public int FailedRows { get; set; }
        public string Status { get; set; }
        public string Message { get; set; }
        public List<string> Errors { get; set; }

    }
}