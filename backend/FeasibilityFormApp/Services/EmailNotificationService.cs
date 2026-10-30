using System.Net;
using System.Net.Mail;
using System.Net.Mime;
using Microsoft.Extensions.Options;

namespace FeasibilityFormApp.Services
{
    public class EmailNotificationService : IEmailNotificationService
    {
        private readonly EmailSettings _settings;
        private readonly ILogger<EmailNotificationService> _logger;

        public EmailNotificationService(
            IOptions<EmailSettings> settings,
            ILogger<EmailNotificationService> logger
        )
        {
            _settings = settings.Value;
            _logger = logger;
        }

        public void QueueBatchNotification(
            WorkflowEmailTarget target,
            long batchId,
            string submittedBy,
            DateTime submittedAt
        )
        {
            _ = Task.Run(() =>
                SendAsync(target, batchId, submittedBy, submittedAt));
        }

        private async Task SendAsync(
            WorkflowEmailTarget target,
            long batchId,
            string submittedBy,
            DateTime submittedAt
        )
        {
            try
            {
                if (!_settings.Enabled)
                {
                    _logger.LogInformation(
                        "Email notifications are disabled. Skipped {Target} notification for batch {BatchId}.",
                        target, batchId);
                    return;
                }

                var senderAddress = GetSender(target);

                if (string.IsNullOrWhiteSpace(_settings.SmtpHost) ||
                    string.IsNullOrWhiteSpace(senderAddress) ||
                    !MailAddress.TryCreate(senderAddress, out _))
                {
                    _logger.LogError(
                        "Email settings incomplete: SmtpHost and a valid sender address are required. Batch {BatchId} notification to {Target} was not sent.",
                        batchId, target);
                    return;
                }

                var recipients = GetRecipients(target);

                if (recipients.Count == 0)
                {
                    _logger.LogError(
                        "No valid recipient addresses configured for {Target}. Batch {BatchId} notification was not sent.",
                        target, batchId);
                    return;
                }

                var (subject, action, submitterRole) = GetContent(target);
                var submittedText = submittedAt.ToString("dd-MMM-yyyy hh:mm tt");
                var appUrl = _settings.AppUrl;

                var plainBody =
$@"Dear {target} Team,

A parameter batch has been submitted and requires your attention.

Batch ID: {batchId}
Submitted On: {submittedText}
Submitted By ({submitterRole}): {submittedBy}

{action}

Parameter Upload Software: {appUrl}

Regards,
EFRAC Parameter Upload System";

                static string e(string? value) => WebUtility.HtmlEncode(value) ?? string.Empty;
                var htmlBody =
$@"<div style=""font-family:Segoe UI,Arial,sans-serif;font-size:14px;color:#222;"">
<p>Dear {e(target.ToString())} Team,</p>
<p>A parameter batch has been submitted and requires your attention.</p>
<table style=""border-collapse:collapse;"">
<tr><td style=""padding:4px 12px 4px 0;""><b>Batch ID</b></td><td>{batchId}</td></tr>
<tr><td style=""padding:4px 12px 4px 0;""><b>Submitted On</b></td><td>{e(submittedText)}</td></tr>
<tr><td style=""padding:4px 12px 4px 0;""><b>Submitted By ({e(submitterRole)})</b></td><td>{e(submittedBy)}</td></tr>
</table>
<p>{e(action)}</p>
<p><a href=""{e(appUrl)}"">Open Parameter Upload Software</a></p>
<p>Regards,<br/>EFRAC Parameter Upload System</p>
</div>";

                using var message = new MailMessage
                {
                    From = new MailAddress(
                        senderAddress,
                        _settings.FromDisplayName),
                    Subject = subject,
                    Body = plainBody,
                    IsBodyHtml = false
                };

                foreach (var r in recipients)
                    message.To.Add(r);

                message.AlternateViews.Add(
                    AlternateView.CreateAlternateViewFromString(
                        htmlBody, null, MediaTypeNames.Text.Html));

                using var client = new SmtpClient(
                    _settings.SmtpHost, _settings.SmtpPort)
                {
                    EnableSsl = _settings.EnableSsl,
                    Timeout = 20000
                };

                if (!string.IsNullOrWhiteSpace(_settings.Username))
                {
                    client.Credentials = new NetworkCredential(
                        _settings.Username, _settings.Password);
                }

                await client.SendMailAsync(message);

                _logger.LogInformation(
                    "Email sent to {Target} team ({Count} recipient(s)) for batch {BatchId}.",
                    target, recipients.Count, batchId);
            }
            catch (Exception ex)
            {
                // Message only (no credentials, no email content).
                _logger.LogError(
                    ex,
                    "Failed to send {Target} notification for batch {BatchId}.",
                    target, batchId);
            }
        }

        // Quotation->Lab email is sent as Quotation, Lab->Reviewer as Lab,
        // Reviewer->Admin as Reviewer. Falls back to FromAddress if empty.
        private string GetSender(WorkflowEmailTarget target)
        {
            var sender = target switch
            {
                WorkflowEmailTarget.Lab => _settings.QuotationSenderAddress,
                WorkflowEmailTarget.Reviewer => _settings.LabSenderAddress,
                WorkflowEmailTarget.Admin => _settings.ReviewerSenderAddress,
                _ => string.Empty
            };

            return string.IsNullOrWhiteSpace(sender)
                ? (_settings.FromAddress ?? string.Empty).Trim()
                : sender.Trim();
        }

        private List<string> GetRecipients(WorkflowEmailTarget target)
        {
            var configured = target switch
            {
                WorkflowEmailTarget.Lab => _settings.LabRecipients,
                WorkflowEmailTarget.Reviewer => _settings.ReviewerRecipients,
                WorkflowEmailTarget.Admin => _settings.AdminRecipients,
                _ => new List<string>()
            };

            var valid = new List<string>();

            foreach (var address in configured ?? new List<string>())
            {
                var a = address?.Trim();
                if (string.IsNullOrWhiteSpace(a)) continue;

                if (MailAddress.TryCreate(a, out _))
                    valid.Add(a);
                else
                    _logger.LogWarning(
                        "Ignored invalid {Target} recipient address in configuration.",
                        target);
            }

            return valid;
        }

        private static (string Subject, string Action, string SubmitterRole)
            GetContent(WorkflowEmailTarget target)
        {
            return target switch
            {
                WorkflowEmailTarget.Lab => (
                    "Action Required: New Parameter Batch Submitted to Lab",
                    "Please review the batch and complete all mandatory Lab-specific fields.",
                    "Quotation"),
                WorkflowEmailTarget.Reviewer => (
                    "Action Required: Parameter Batch Submitted for Review",
                    "Please verify the submitted information.",
                    "Lab"),
                _ => (
                    "Action Required: Parameter Batch Ready for Admin Processing",
                    "Please review the batch and upload the approved parameter data into the LIMS master database.",
                    "Reviewer")
            };
        }
    }
}