using FeasibilityFormApp.Models;
using FeasibilityFormApp.Services;
using Microsoft.AspNetCore.Mvc;

namespace FeasibilityFormApp.Controllers
{
    [ApiController]
    [Route("api/parameters")]
    public class ParameterController : Controller
    {
        private readonly IParameterService _parameterService;
        private readonly ILogger<ParameterController> _logger;

        public ParameterController(
            IParameterService parameterService,
            ILogger<ParameterController> logger
        )
        {
            _parameterService = parameterService;
            _logger = logger;
        }


        [HttpPost("upload")]
        public async Task<IActionResult> UploadParameters(
            [FromBody] ParameterUploadRequest request
        )
        {
            try
            {
                if (request == null)
                {
                    return BadRequest(new
                    {
                        status = "Failed",
                        message = "Request body is required"
                    });
                }


                var result =
                    await _parameterService.UploadParametersAsync(
                        request
                    );


                if (result.Status == "Failed")
                {
                    return BadRequest(result);
                }


                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error in UploadParameters endpoint"
                );


                return StatusCode(
                    500,
                    new ParameterUploadResponse
                    {
                        Status = "Failed",
                        Message =
                            "Internal server error occurred",
                        TotalRows = 0,
                        SuccessfulRows = 0,
                        FailedRows = 0,
                        Errors = new List<string>
                        {
                            ex.Message
                        }
                    }
                );
            }
        }


        [HttpPut]
        public async Task<IActionResult> UpdateParameters(
            [FromBody] ParameterUpdateRequest request
        )
        {
            try
            {
                await _parameterService.UpdateParametersAsync(
                    request
                );


                return Ok(
                    "Parameters updated successfully."
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error in UpdateParameters endpoint"
                );


                return StatusCode(
                    500,
                    new ParameterUploadResponse
                    {
                        Status = "Failed",
                        Message =
                            "Internal server error occurred",
                        TotalRows = 0,
                        SuccessfulRows = 0,
                        FailedRows = 0,
                        Errors = new List<string>
                        {
                            ex.Message
                        }
                    }
                );
            }
        }


        [HttpGet("logs")]
        public async Task<IActionResult> GetUploadLogs(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10
        )
        {
            try
            {
                if (pageNumber < 1)
                {
                    return BadRequest(new
                    {
                        message =
                            "Page number must be greater than 0"
                    });
                }


                if (pageSize < 1 || pageSize > 100)
                {
                    return BadRequest(new
                    {
                        message =
                            "Page size must be between 1 and 100"
                    });
                }


                var logs =
                    await _parameterService.GetUploadLogsAsync(
                        pageNumber,
                        pageSize
                    );


                return Ok(logs);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error in GetUploadLogs endpoint"
                );

                return StatusCode(
                    500,
                    new
                    {
                        message =
                            "Error fetching upload logs"
                    }
                );
            }
        }


        [HttpGet("search")]
        public async Task<IActionResult> SearchParameters(
            [FromQuery] string employeeId,
            [FromQuery] string role,
            [FromQuery] string term = null,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 50
        )
        {
            try
            {
                if (pageNumber < 1)
                {
                    return BadRequest(new
                    {
                        message =
                            "Page number must be greater than 0"
                    });
                }


                if (pageSize < 1 || pageSize > 100)
                {
                    return BadRequest(new
                    {
                        message =
                            "Page size must be between 1 and 100"
                    });
                }


                var parameters =
                    await _parameterService.GetParametersAsync(
                        employeeId,
                        role,
                        term,
                        pageNumber,
                        pageSize
                    );


                return Ok(parameters);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error in SearchParameters endpoint"
                );

                return StatusCode(
                    500,
                    new
                    {
                        message =
                            "Error fetching parameters"
                    }
                );
            }
        }


        [HttpGet("dropdown-options")]
        public async Task<IActionResult>
            GetDropdownOptions()
        {
            try
            {
                var options =
                    await _parameterService
                        .GetDropdownOptionsAsync();


                return Ok(options);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error in GetDropdownOptions endpoint"
                );


                return StatusCode(
                    500,
                    new
                    {
                        message =
                            "Error fetching dropdown options"
                    }
                );
            }
        }


        [HttpGet]
        public async Task<IActionResult> GetParameters(
            [FromQuery] string employeeId,
            [FromQuery] string role,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 50
        )
        {
            try
            {
                if (pageNumber < 1)
                {
                    return BadRequest(new
                    {
                        message =
                            "Page number must be greater than 0"
                    });
                }


                if (pageSize < 1 || pageSize > 100)
                {
                    return BadRequest(new
                    {
                        message =
                            "Page size must be between 1 and 100"
                    });
                }


                var parameters =
                    await _parameterService.GetParametersAsync(
                        employeeId,
                        role,
                        null,
                        pageNumber,
                        pageSize
                    );


                return Ok(parameters);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error in GetParameters endpoint"
                );

                return StatusCode(
                    500,
                    new
                    {
                        message =
                            "Error fetching parameters"
                    }
                );
            }
        }


        [HttpPost("upload-to-master/{batchId}")]
        public async Task<IActionResult> UploadToMaster(
            long batchId,
            [FromBody] ParameterUploadRequest request
        )
        {
            try
            {
                if (
                    request == null ||
                    string.IsNullOrWhiteSpace(
                        request.UploadedBy
                    )
                )
                {
                    return BadRequest(new
                    {
                        status = "Failed",
                        message = "UploadedBy is required"
                    });
                }


                if (!string.Equals(
                        request.UploadedBy.Trim(),
                        "admin",
                        StringComparison.OrdinalIgnoreCase))
                {
                    return StatusCode(
                        StatusCodes.Status403Forbidden,
                        new ParameterUploadResponse
                        {
                            Status = "Failed",
                            Message = "Only Admin can upload parameters to master tables.",
                            Errors = new List<string>
                            {
                                "Only Admin can upload parameters to master tables."
                            }
                        }
                    );
                }

                var result =
                    await _parameterService
                        .UploadToMasterTablesAsync(
                            batchId,
                            request.UploadedBy.Trim()
                        );


                if (result.Status == "Failed")
                {
                    return BadRequest(result);
                }


                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error in UploadToMaster endpoint"
                );


                return StatusCode(
                    500,
                    new ParameterUploadResponse
                    {
                        Status = "Failed",
                        Message =
                            "Internal server error occurred while uploading to master tables",
                        TotalRows = 0,
                        SuccessfulRows = 0,
                        FailedRows = 0,
                        Errors = new List<string>
                        {
                            ex.Message
                        }
                    }
                );
            }
        }

        // ============================================================
        // REVERT FINAL MASTER UPLOAD
        // ============================================================
        [HttpPost("revert-master-upload/{batchId}")]
        public async Task<IActionResult> RevertMasterUpload(
            long batchId,
            [FromBody] RevertMasterUploadRequest request
        )
        {
            try
            {
                if (batchId <= 0)
                {
                    return BadRequest(new
                    {
                        status = "Failed",
                        message = "Valid BatchId is required"
                    });
                }

                if (request == null ||
                    string.IsNullOrWhiteSpace(request.UserId))
                {
                    return BadRequest(new
                    {
                        status = "Failed",
                        message = "UserId is required"
                    });
                }

                if (!string.Equals(
                        request.UserId.Trim(),
                        "admin",
                        StringComparison.OrdinalIgnoreCase))
                {
                    return StatusCode(
                        StatusCodes.Status403Forbidden,
                        new
                        {
                            status = "Failed",
                            message = "Only Admin can revert the final master upload."
                        }
                    );
                }

                var result =
                    await _parameterService.RevertMasterUploadAsync(
                        batchId,
                        request.UserId.Trim()
                    );

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error reverting final master upload for Batch {BatchId}",
                    batchId
                );

                return BadRequest(new
                {
                    status = "Failed",
                    message = ex.Message
                });
            }
        }

        public class RevertMasterUploadRequest
        {
            public string UserId { get; set; } = string.Empty;
        }


        // ============================================================
        // ADMIN SENDS REVERTED BATCH BACK TO REVIEWER
        // ============================================================
        [HttpPost("workflow/{batchId}/send-back-to-reviewer")]
        public async Task<IActionResult> SendBackToReviewer(
            long batchId,
            [FromBody] SendBackToReviewerRequest request
        )
        {
            try
            {
                if (batchId <= 0)
                {
                    return BadRequest(new
                    {
                        status = "Failed",
                        message = "Valid BatchId is required"
                    });
                }

                if (request == null ||
                    string.IsNullOrWhiteSpace(request.UserId))
                {
                    return BadRequest(new
                    {
                        status = "Failed",
                        message = "UserId is required"
                    });
                }

                if (!string.Equals(
                        request.UserId.Trim(),
                        "admin",
                        StringComparison.OrdinalIgnoreCase))
                {
                    return StatusCode(
                        StatusCodes.Status403Forbidden,
                        new
                        {
                            status = "Failed",
                            message = "Only Admin can send a reverted batch back to Reviewer."
                        }
                    );
                }

                var userSystem =
                    HttpContext.Connection.RemoteIpAddress?.ToString()
                    ?? "FeasibilityFormApp";

                var result =
                    await _parameterService.SendBackToReviewerAsync(
                        batchId,
                        request.UserId.Trim(),
                        userSystem,
                        request.Remarks
                    );

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error sending reverted batch {BatchId} back to Reviewer",
                    batchId
                );

                return BadRequest(new
                {
                    status = "Failed",
                    message = ex.Message
                });
            }
        }

        public class SendBackToReviewerRequest
        {
            public string UserId { get; set; } = string.Empty;
            public string? Remarks { get; set; }
        }


        // ============================================================
        // WORKFLOW TRACKER
        // ============================================================
        [HttpGet("workflow/{batchId}/tracker")]
        public async Task<IActionResult> GetWorkflowTracker(long batchId)
        {
            try
            {
                if (batchId <= 0)
                {
                    return BadRequest(new
                    {
                        message = "Valid BatchId is required"
                    });
                }

                var result =
                    await _parameterService.GetWorkflowTrackerAsync(batchId);

                if (result == null)
                {
                    return NotFound(new
                    {
                        message = $"Workflow information for Batch {batchId} was not found."
                    });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error fetching workflow tracker for Batch {BatchId}",
                    batchId
                );

                return StatusCode(
                    500,
                    new
                    {
                        message = "Error fetching workflow tracker",
                        detail = ex.Message
                    }
                );
            }
        }


        // ============================================================
        // SUBMIT QUOTATION BATCH TO LAB
        // ============================================================
        [HttpPost("workflow/{batchId}/submit-to-lab")]
        public async Task<IActionResult> SubmitToLab(
            long batchId,
            [FromBody] SubmitToLabRequest request
        )
        {
            try
            {
                if (batchId <= 0)
                {
                    return BadRequest(new
                    {
                        status = "Failed",
                        message = "Valid BatchId is required"
                    });
                }

                if (request == null ||
                    string.IsNullOrWhiteSpace(request.UserId))
                {
                    return BadRequest(new
                    {
                        status = "Failed",
                        message = "UserId is required"
                    });
                }

                var userSystem =
                    HttpContext.Connection.RemoteIpAddress?.ToString()
                    ?? "FeasibilityFormApp";

                var result =
                    await _parameterService.SubmitToLabAsync(
                        batchId,
                        request.UserId,
                        userSystem,
                        request.Remarks
                    );

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error submitting batch {BatchId} to Lab",
                    batchId
                );

                return BadRequest(new
                {
                    status = "Failed",
                    message = ex.Message
                });
            }
        }

        public class SubmitToLabRequest
        {
            public string UserId { get; set; } = string.Empty;
            public string? Remarks { get; set; }
        }

        // ============================================================
        // SUBMIT LAB BATCH TO REVIEWER
        // ============================================================
        [HttpPost("workflow/{batchId}/submit-to-reviewer")]
        public async Task<IActionResult> SubmitToReviewer(
            long batchId,
            [FromBody] SubmitToReviewerRequest request
        )
        {
            try
            {
                if (batchId <= 0)
                {
                    return BadRequest(new
                    {
                        status = "Failed",
                        message = "Valid BatchId is required"
                    });
                }

                if (request == null ||
                    string.IsNullOrWhiteSpace(request.UserId))
                {
                    return BadRequest(new
                    {
                        status = "Failed",
                        message = "UserId is required"
                    });
                }

                var userSystem =
                    HttpContext.Connection.RemoteIpAddress?.ToString()
                    ?? "FeasibilityFormApp";

                var result =
                    await _parameterService.SubmitToReviewerAsync(
                        batchId,
                        request.UserId,
                        userSystem,
                        request.Remarks
                    );

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error submitting batch {BatchId} to Reviewer",
                    batchId
                );

                return BadRequest(new
                {
                    status = "Failed",
                    message = ex.Message
                });
            }
        }


        [HttpPost("workflow/{batchId}/submit-to-admin")]
        public async Task<IActionResult> SubmitToAdmin(
            long batchId,
            [FromBody] SubmitToAdminRequest request
        )
        {
            if (request == null || string.IsNullOrWhiteSpace(request.UserId))
            {
                return BadRequest(new ParameterUploadResponse
                {
                    Status = "Failed",
                    Message = "Reviewer user ID is required.",
                    Errors = new List<string> { "Reviewer user ID is required." }
                });
            }

            try
            {
                var userSystem =
                    HttpContext.Connection.RemoteIpAddress?.ToString()
                    ?? "FeasibilityFormApp";

                var result =
                    await _parameterService.SubmitToAdminAsync(
                        batchId,
                        request.UserId,
                        userSystem,
                        request.Remarks
                    );

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new ParameterUploadResponse
                {
                    Status = "Failed",
                    Message = ex.Message,
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        public class SubmitToAdminRequest
        {
            public string UserId { get; set; } = string.Empty;
            public string? Remarks { get; set; }
        }

        public class SubmitToReviewerRequest
        {
            public string UserId { get; set; } = string.Empty;
            public string? Remarks { get; set; }
        }


    }
}