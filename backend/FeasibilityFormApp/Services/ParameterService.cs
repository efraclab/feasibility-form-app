using FeasibilityFormApp.Models;
using FeasibilityFormApp.Repositories;

namespace FeasibilityFormApp.Services
{
    public class ParameterService : IParameterService
    {
        private readonly IParameterRepository _parameterRepository;
        private readonly ILogger<ParameterService> _logger;

        public ParameterService(
            IParameterRepository parameterRepository,
            ILogger<ParameterService> logger
        )
        {
            _parameterRepository = parameterRepository;
            _logger = logger;
        }


        // ============================================================
        // UPLOAD PARAMETERS
        // ============================================================

        public async Task<ParameterUploadResponse> UploadParametersAsync(
            ParameterUploadRequest request
        )
        {
            try
            {
                // ----------------------------------------------------
                // BASIC REQUEST VALIDATION
                // ----------------------------------------------------

                if (
                    request == null ||
                    request.Parameters == null ||
                    !request.Parameters.Any()
                )
                {
                    return new ParameterUploadResponse
                    {
                        Status = "Failed",
                        Message = "No parameters provided",
                        TotalRows = 0,
                        SuccessfulRows = 0,
                        FailedRows = 0,
                        Errors = new List<string>
                        {
                            "Request is empty or invalid"
                        }
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
                        Errors = new List<string>
                        {
                            "FileName cannot be empty"
                        }
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
                        Errors = new List<string>
                        {
                            "UploadedBy cannot be empty"
                        }
                    };
                }


                // ====================================================
                // QUOTATION TEAM VALIDATION
                // ====================================================
                //
                // Mandatory for every row:
                //
                // 1. Commodity Name
                // 2. Parameter Name
                // 3. Lab Name
                // 4. Regulation Name
                //
                // If the row belongs to Drug:
                //
                // 5. Parameter Individual Rate
                // 6. Regulatory Rate Drug
                //
                // Drug identification currently supports:
                //
                // NonFssaiFssaiDrugCode = "003"
                // OR
                // NonFssaiFssaiDrug = "Drug"
                //
                // ====================================================

                var validationErrors = new List<string>();


                for (
                    int i = 0;
                    i < request.Parameters.Count;
                    i++
                )
                {
                    var param =
                        request.Parameters[i];

                    var rowNo =
                        i + 1;


                    // ------------------------------------------------
                    // COMMODITY NAME
                    // ------------------------------------------------

                    if (
                        string.IsNullOrWhiteSpace(
                            param.CommodityName
                        )
                    )
                    {
                        validationErrors.Add(
                            $"Row {rowNo}: Commodity Name is required"
                        );
                    }


                    // ------------------------------------------------
                    // PARAMETER NAME
                    // ------------------------------------------------


                    // ------------------------------------------------
                    // LAB NAME
                    //
                    // Current model/database field:
                    // ParameterLabDistribution
                    // ------------------------------------------------

                    if (
                        string.IsNullOrWhiteSpace(
                            param.ParameterLabDistribution
                        )
                    )
                    {
                        validationErrors.Add(
                            $"Row {rowNo}: Lab Name is required"
                        );
                    }


                    // ------------------------------------------------
                    // REGULATION NAME
                    // ------------------------------------------------

                    if (
                        string.IsNullOrWhiteSpace(
                            param.RegulationName
                        )
                    )
                    {
                        validationErrors.Add(
                            $"Row {rowNo}: Regulation Name is required"
                        );
                    }


                    // =================================================
                    // DRUG CHECK
                    // =================================================

                    var isDrug =
                        string.Equals(
                            param
                                .NonFssaiFssaiDrugCode
                                ?.Trim(),
                            "003",
                            StringComparison
                                .OrdinalIgnoreCase
                        )
                        ||
                        string.Equals(
                            param
                                .NonFssaiFssaiDrug
                                ?.Trim(),
                            "Drug",
                            StringComparison
                                .OrdinalIgnoreCase
                        );


                    if (isDrug)
                    {
                        // ---------------------------------------------
                        // PARAMETER INDIVIDUAL RATE
                        // ---------------------------------------------

                        if (
                            !param
                                .ParameterIndividualRate
                                .HasValue
                        )
                        {
                            validationErrors.Add(
                                $"Row {rowNo}: Parameter Individual Rate is required for Drug"
                            );
                        }


                        // ---------------------------------------------
                        // REGULATORY RATE DRUG
                        // ---------------------------------------------

                        if (
                            !param
                                .RegulatoryRateDrug
                                .HasValue
                        )
                        {
                            validationErrors.Add(
                                $"Row {rowNo}: Regulatory Rate Drug is required for Drug"
                            );
                        }
                    }
                }


                // ----------------------------------------------------
                // RETURN ALL VALIDATION ERRORS
                // ----------------------------------------------------

                if (validationErrors.Any())
                {
                    return new ParameterUploadResponse
                    {
                        Status = "Failed",
                        Message = "Validation failed",

                        TotalRows =
                            request.Parameters.Count,

                        SuccessfulRows = 0,

                        FailedRows =
                            request.Parameters.Count,

                        Errors =
                            validationErrors
                    };
                }


                // ----------------------------------------------------
                // LOG UPLOAD START
                // ----------------------------------------------------

                _logger.LogInformation(
                    "Starting parameter upload. File: {FileName}, Rows: {RowCount}, User: {User}",
                    request.FileName,
                    request.Parameters.Count,
                    request.UploadedBy
                );


                // ----------------------------------------------------
                // INSERT INTO BUFFER
                // ----------------------------------------------------

                var result =
                    await _parameterRepository
                        .BulkInsertParametersAsync(
                            request
                        );


                // ----------------------------------------------------
                // LOG UPLOAD COMPLETION
                // ----------------------------------------------------

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
                _logger.LogError(
                    ex,
                    "Error uploading parameters. File: {FileName}",
                    request?.FileName
                );


                return new ParameterUploadResponse
                {
                    Status = "Failed",

                    Message =
                        "An error occurred during upload",

                    TotalRows =
                        request?.Parameters?.Count ?? 0,

                    SuccessfulRows = 0,

                    FailedRows =
                        request?.Parameters?.Count ?? 0,

                    Errors = new List<string>
                    {
                        ex.Message
                    }
                };
            }
        }


        // ============================================================
        // UPDATE PARAMETERS
        // ============================================================

        public async Task UpdateParametersAsync(
            ParameterUpdateRequest request
        )
        {
            try
            {
                if (
                    request == null ||
                    request.Parameters == null ||
                    !request.Parameters.Any()
                )
                {
                    throw new Exception(
                        "Can't proceed with invalid updation request."
                    );
                }


                foreach (
                    var param
                    in request.Parameters
                )
                {
                    await _parameterRepository
                        .UpdateParameterAsync(
                            param,
                            request.UpdatedBy,
                            request.ReviewedBy,
                            request.Remarks
                        );
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error updating parameters"
                );

                throw;
            }
        }


        // ============================================================
        // GET UPLOAD LOGS
        // ============================================================

        public async Task<
            IEnumerable<ParameterUploadLog>
        >
            GetUploadLogsAsync(
                int pageNumber = 1,
                int pageSize = 10
            )
        {
            try
            {
                return await _parameterRepository
                    .GetUploadLogsAsync(
                        pageNumber,
                        pageSize
                    );
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error fetching upload logs"
                );

                throw;
            }
        }


        // ============================================================
        // GET / SEARCH PARAMETERS
        // ============================================================

        public async Task<
            IEnumerable<ParameterMaster>
        >
            GetParametersAsync(
                string employeeId,
                string role,
                string searchTerm = null,
                int pageNumber = 1,
                int pageSize = 50
            )
        {
            try
            {
                return await _parameterRepository
                    .GetParametersAsync(
                        employeeId,
                        role,
                        searchTerm,
                        pageNumber,
                        pageSize
                    );
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error fetching parameters. SearchTerm: {SearchTerm}",
                    searchTerm
                );

                throw;
            }
        }


        // ============================================================
        // UPLOAD APPROVED DATA TO MASTER
        // ============================================================

        public async Task<ParameterUploadResponse>
            UploadToMasterTablesAsync(
                long batchId,
                string uploadedBy
            )
        {
            if (batchId <= 0)
                throw new ArgumentException("A valid batch ID is required.");

            if (!string.Equals(
                    uploadedBy?.Trim(),
                    "admin",
                    StringComparison.OrdinalIgnoreCase))
            {
                throw new UnauthorizedAccessException(
                    "Only Admin can upload parameters to master tables."
                );
            }

            try
            {
                return await _parameterRepository
                    .UploadToMasterTablesAsync(
                        batchId,
                        uploadedBy.Trim()
                    );
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error uploading parameters to master database."
                );

                throw;
            }
        }


        // ============================================================
        // GET DROPDOWN OPTIONS
        // ============================================================

        public async Task<ParameterDropdownOptions>
            GetDropdownOptionsAsync()
        {
            try
            {
                return await _parameterRepository
                    .GetDropdownOptionsAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error fetching parameter dropdown options"
                );

                throw;
            }
        }

        // ============================================================
        // WORKFLOW TRACKER
        // ============================================================
        public async Task<WorkflowTrackerResponse?> GetWorkflowTrackerAsync(
            long batchId
        )
        {
            if (batchId <= 0)
                throw new ArgumentException("Valid BatchId is required.");

            return await _parameterRepository.GetWorkflowTrackerAsync(batchId);
        }


        // ============================================================
        // SUBMIT QUOTATION BATCH TO LAB
        // ============================================================
        public async Task<ParameterUploadResponse> SubmitToLabAsync(
            long batchId,
            string userId,
            string? userSystem,
            string? remarks
        )
        {
            if (batchId <= 0)
                throw new ArgumentException("Valid BatchId is required.");

            if (string.IsNullOrWhiteSpace(userId))
                throw new ArgumentException("UserId is required.");

            try
            {
                return await _parameterRepository.SubmitToLabAsync(
                    batchId,
                    userId.Trim(),
                    userSystem,
                    remarks
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error submitting batch {BatchId} from Quotation to Lab.",
                    batchId
                );

                throw;
            }
        }

        // ============================================================
        // SUBMIT LAB BATCH TO REVIEWER
        // ============================================================
        public async Task<ParameterUploadResponse> SubmitToReviewerAsync(
            long batchId,
            string userId,
            string? userSystem,
            string? remarks
        )
        {
            if (batchId <= 0)
                throw new ArgumentException("Valid BatchId is required.");

            if (string.IsNullOrWhiteSpace(userId))
                throw new ArgumentException("UserId is required.");

            try
            {
                return await _parameterRepository.SubmitToReviewerAsync(
                    batchId,
                    userId.Trim(),
                    userSystem,
                    remarks
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error submitting batch {BatchId} from Lab to Reviewer.",
                    batchId
                );

                throw;
            }
        }

        public async Task<ParameterUploadResponse> SubmitToAdminAsync(
            long batchId,
            string userId,
            string? userSystem,
            string? remarks
        )
        {
            if (batchId <= 0)
                throw new ArgumentException("A valid batch ID is required.");

            if (string.IsNullOrWhiteSpace(userId))
                throw new ArgumentException("Reviewer user ID is required.");

            return await _parameterRepository.SubmitToAdminAsync(
                batchId,
                userId.Trim(),
                userSystem,
                remarks
            );
        }


    }
}