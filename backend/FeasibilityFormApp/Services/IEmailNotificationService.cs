namespace FeasibilityFormApp.Services
{
    public enum WorkflowEmailTarget
    {
        Lab,
        Reviewer,
        Admin
    }

    public interface IEmailNotificationService
    {
        // Never throws. Sends in the background so a slow or failed
        // email server cannot affect the batch submission.
        void QueueBatchNotification(
            WorkflowEmailTarget target,
            long batchId,
            string submittedBy,
            DateTime submittedAt
        );
    }
}