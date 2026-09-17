using FeasibilityFormApp.Models;

namespace FeasibilityFormApp.Services
{
    public interface IParameterService
    {
        Task<ParameterUploadResponse> UploadParametersAsync(
            ParameterUploadRequest request
        );

        Task<IEnumerable<ParameterUploadLog>> GetUploadLogsAsync(
            int pageNumber = 1,
            int pageSize = 10
        );

        Task<IEnumerable<ParameterMaster>> GetParametersAsync(
            string employeeId,
            string role,
            string searchTerm = null,
            int pageNumber = 1,
            int pageSize = 50
        );

        Task UpdateParametersAsync(
            ParameterUpdateRequest request
        );

        Task<ParameterUploadResponse> UploadToMasterTablesAsync(
            long batchId,
            string uploadedBy
        );

        Task<ParameterUploadResponse> RevertMasterUploadAsync(
            long batchId,
            string revertedBy
        );

        Task<ParameterUploadResponse> SendBackToReviewerAsync(
            long batchId,
            string userId,
            string? userSystem,
            string? remarks
        );

        Task<ParameterDropdownOptions> GetDropdownOptionsAsync();

        Task<WorkflowTrackerResponse?> GetWorkflowTrackerAsync(
            long batchId
        );

        Task<ParameterUploadResponse> SubmitToLabAsync(
            long batchId,
            string userId,
            string? userSystem,
            string? remarks
        );

        Task<ParameterUploadResponse> SubmitToReviewerAsync(
            long batchId,
            string userId,
            string? userSystem,
            string? remarks
        );

        Task<ParameterUploadResponse> SubmitToAdminAsync(
            long batchId,
            string userId,
            string? userSystem,
            string? remarks
        );
    }
}