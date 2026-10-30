namespace FeasibilityFormApp.Services
{
    public class EmailSettings
    {
        public bool Enabled { get; set; } = false;

        public string SmtpHost { get; set; } = string.Empty;
        public int SmtpPort { get; set; } = 587;
        public bool EnableSsl { get; set; } = true;

        // Leave Username/Password empty if your SMTP server needs no login.
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;

        // Fallback sender, used only if a team sender below is empty.
        public string FromAddress { get; set; } = string.Empty;

        // Sender per stage: the team that submits the batch.
        public string QuotationSenderAddress { get; set; } = string.Empty;
        public string LabSenderAddress { get; set; } = string.Empty;
        public string ReviewerSenderAddress { get; set; } = string.Empty;
        public string FromDisplayName { get; set; } = "EFRAC Parameter Upload System";

        // Link placed in every email.
        public string AppUrl { get; set; } = "http://192.168.2.220:5176/";

        public List<string> LabRecipients { get; set; } = new();
        public List<string> ReviewerRecipients { get; set; } = new();
        public List<string> AdminRecipients { get; set; } = new();
    }
}