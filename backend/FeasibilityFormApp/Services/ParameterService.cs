using Azure.Core;
using FeasibilityFormApp.Models;
using FeasibilityFormApp.Repositories;
using System.Data;

namespace FeasibilityFormApp.Services
{

    public class ParameterService : IParameterService
    {
        private readonly IParameterRepository _parameterRepository;
        private readonly ILogger<ParameterService> _logger;

        public ParameterService(
            IParameterRepository parameterRepository,
            ILogger<ParameterService> logger)
        {
            _parameterRepository = parameterRepository;
            _logger = logger;
        }

        public async Task<ParameterUploadResponse> UploadParametersAsync(ParameterUploadRequest request)
        {
            try
            {
                // Validation
                if (request == null || request.Parameters == null || !request.Parameters.Any())
                {
                    return new ParameterUploadResponse
                    {
                        Status = "Failed",
                        Message = "No parameters provided",
                        TotalRows = 0,
                        SuccessfulRows = 0,
                        FailedRows = 0,
                        Errors = new List<string> { "Request is empty or invalid" }
                    };
                }

                if (string.IsNullOrWhiteSpace(request.FileName))
                {
                    return new ParameterUploadResponse
                    {
                        Status = "Failed",
                        Message = "File name is required",
                        TotalRows = 0,
                        SuccessfulRows = 0,
                        FailedRows = 0,
                        Errors = new List<string> { "FileName cannot be empty" }
                    };
                }

                if (string.IsNullOrWhiteSpace(request.UploadedBy))
                {
                    return new ParameterUploadResponse
                    {
                        Status = "Failed",
                        Message = "Uploaded by user is required",
                        TotalRows = 0,
                        SuccessfulRows = 0,
                        FailedRows = 0,
                        Errors = new List<string> { "UploadedBy cannot be empty" }
                    };
                }

                // Validate each parameter has required fields
                var validationErrors = new List<string>();
                for (int i = 0; i < request.Parameters.Count; i++)
                {
                    var param = request.Parameters[i];

                    if (string.IsNullOrWhiteSpace(param.ParameterName))
                    {
                        validationErrors.Add($"Row {i + 1}: Parameter Name is required");
                    }

                }

                if (validationErrors.Any())
                {
                    return new ParameterUploadResponse
                    {
                        Status = "Failed",
                        Message = "Validation failed",
                        TotalRows = request.Parameters.Count,
                        SuccessfulRows = 0,
                        FailedRows = request.Parameters.Count,
                        Errors = validationErrors
                    };
                }

                _logger.LogInformation(
                    "Starting parameter upload. File: {FileName}, Rows: {RowCount}, User: {User}",
                    request.FileName,
                    request.Parameters.Count,
                    request.UploadedBy
                );

                var result = await _parameterRepository.BulkInsertParametersAsync(request);

                _logger.LogInformation(
                    "Parameter upload completed. Status: {Status}, Success: {Success}, Failed: {Failed}",
                    result.Status,
                    result.SuccessfulRows,
                    result.FailedRows
                );

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading parameters. File: {FileName}", request?.FileName);

                return new ParameterUploadResponse
                {
                    Status = "Failed",
                    Message = "An error occurred during upload",
                    TotalRows = request?.Parameters?.Count ?? 0,
                    SuccessfulRows = 0,
                    FailedRows = request?.Parameters?.Count ?? 0,
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        public async Task UpdateParametersAsync(ParameterUpdateRequest request)
        {
            try
            {
                if (request == null || request.Parameters == null || !request.Parameters.Any())
                {
                    throw new Exception("Can't proceed with invalid updation request.");
                }

                request.Parameters.ForEach(async param =>
                {
                    await _parameterRepository.UpdateParameterAsync(param, request.UpdatedBy, request.ReviewedBy, request.Remarks);
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching upload logs");
                throw;
            }
        }

        public async Task<IEnumerable<ParameterUploadLog>> GetUploadLogsAsync(int pageNumber = 1, int pageSize = 10)
        {
            try
            {
                return await _parameterRepository.GetUploadLogsAsync(pageNumber, pageSize);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching upload logs");
                throw;
            }
        }

        public async Task<IEnumerable<ParameterMaster>> GetParametersAsync(
            string employeeId, string role,
            string searchTerm = null,
            int pageNumber = 1,
            int pageSize = 50)
        {
            try
            {
                return await _parameterRepository.GetParametersAsync(employeeId, role, searchTerm, pageNumber, pageSize);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching parameters. SearchTerm: {SearchTerm}", searchTerm);
                throw;
            }
        }

        public async Task<ParameterUploadResponse> UploadToMasterTablesAsync(long batchId, string uploadedBy)
        {
            try
            {
                return await _parameterRepository.UploadToMasterTablesAsync(batchId, uploadedBy);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading parameters to master database.");
                throw;
            }
        }
    }
}
