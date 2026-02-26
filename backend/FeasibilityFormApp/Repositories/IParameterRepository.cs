using FeasibilityFormApp.Models;

namespace FeasibilityFormApp.Repositories
{
    public interface IParameterRepository
    {
        Task<ParameterUploadResponse> BulkInsertParametersAsync(ParameterUploadRequest request);
        Task<IEnumerable<ParameterMaster>> GetParametersAsync(string employeeId, string role, string searchTerm = null, int pageNumber = 1, int pageSize = 50);
        Task<IEnumerable<ParameterUploadLog>> GetUploadLogsAsync(int pageNumber = 1, int pageSize = 10);
        Task UpdateParameterAsync(ParameterMaster param, string? updatedBy, string? reviewedBy, string? remarks);
        Task<ParameterUploadResponse> UploadToMasterTablesAsync(long batchId, string uploadedBy);
    }
}