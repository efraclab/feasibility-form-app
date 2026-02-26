namespace FeasibilityFormApp.Models
{
    public class ParameterUploadRequest
    {
        public List<ParameterMaster>? Parameters { get; set; }
        public string? FileName { get; set; }
        public string? UploadedBy { get; set; }
    }
}
