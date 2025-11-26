namespace InquiryManagementWebService.Models
{
    public class ClientDetail
    {
        public string ClientCode { get; set; }
        public string ClientName { get; set; }
        public string? Unit { get; set; }
        public string? Address { get; set; }
        public string? Pin { get; set; }
        public string? City { get; set; }
        public string? ContactPersonName { get; set; }
        public string? ContactPersonPhone { get; set; }
        public string? ContactPersonEmail { get; set; }
        public string? GstNo { get; set; }
    }
}
