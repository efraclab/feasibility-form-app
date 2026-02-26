using FeasibilityFormApp.Models;

namespace FeasibilityFormApp.Services
{
    public interface IParameterService
    {
        Task<ParameterUploadResponse> UploadParametersAsync(ParameterUploadRequest request);
        Task<IEnumerable<ParameterUploadLog>> GetUploadLogsAsync(int pageNumber = 1, int pageSize = 10);
        Task<IEnumerable<ParameterMaster>> GetParametersAsync(string employeeId, string role, string searchTerm = null, int pageNumber = 1, int pageSize = 50);
        Task UpdateParametersAsync(ParameterUpdateRequest request);
        Task<ParameterUploadResponse> UploadToMasterTablesAsync(long batchId, string uploadedBy);
    }
}
