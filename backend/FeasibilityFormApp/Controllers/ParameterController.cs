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
            ILogger<ParameterController> logger)
        {
            _parameterService = parameterService;
            _logger = logger;
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadParameters([FromBody] ParameterUploadRequest request)
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

                var result = await _parameterService.UploadParametersAsync(request);

                if (result.Status == "Failed")
                {
                    return BadRequest(result);
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UploadParameters endpoint");

                return StatusCode(500, new ParameterUploadResponse
                {
                    Status = "Failed",
                    Message = "Internal server error occurred",
                    TotalRows = 0,
                    SuccessfulRows = 0,
                    FailedRows = 0,
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        [HttpPut()]
        public async Task<IActionResult> UpdateParameters([FromBody] ParameterUpdateRequest request)
        {
            try
            {
                await _parameterService.UpdateParametersAsync(request);

                return Ok("Parameters updated successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdateParameters endpoint");

                return StatusCode(500, new ParameterUploadResponse
                {
                    Status = "Failed",
                    Message = "Internal server error occurred",
                    TotalRows = 0,
                    SuccessfulRows = 0,
                    FailedRows = 0,
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        [HttpGet("logs")]
        public async Task<IActionResult> GetUploadLogs(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                if (pageNumber < 1)
                {
                    return BadRequest(new { message = "Page number must be greater than 0" });
                }

                if (pageSize < 1 || pageSize > 100)
                {
                    return BadRequest(new { message = "Page size must be between 1 and 100" });
                }

                var logs = await _parameterService.GetUploadLogsAsync(pageNumber, pageSize);

                return Ok(logs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetUploadLogs endpoint");
                return StatusCode(500, new { message = "Error fetching upload logs" });
            }
        }


        [HttpGet("search")]
        public async Task<IActionResult> SearchParameters(
            [FromQuery] string employeeId,
            [FromQuery] string role,
            [FromQuery] string term = null,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 50)
        {
            try
            {
                if (pageNumber < 1)
                {
                    return BadRequest(new { message = "Page number must be greater than 0" });
                }

                if (pageSize < 1 || pageSize > 100)
                {
                    return BadRequest(new { message = "Page size must be between 1 and 100" });
                }

                var parameters = await _parameterService.GetParametersAsync(employeeId, role, term, pageNumber, pageSize);

                return Ok(parameters);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in SearchParameters endpoint");
                return StatusCode(500, new { message = "Error fetching parameters" });
            }
        }


        [HttpGet]
        public async Task<IActionResult> GetParameters(
            [FromQuery] string employeeId,
            [FromQuery] string role,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 50)
        {
            try
            {
                if (pageNumber < 1)
                {
                    return BadRequest(new { message = "Page number must be greater than 0" });
                }

                if (pageSize < 1 || pageSize > 100)
                {
                    return BadRequest(new { message = "Page size must be between 1 and 100" });
                }

                var parameters = await _parameterService.GetParametersAsync(employeeId, role, null, pageNumber, pageSize);

                return Ok(parameters);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetParameters endpoint");
                return StatusCode(500, new { message = "Error fetching parameters" });
            }
        }


        [HttpPost("upload-to-master/{batchId}")]
        public async Task<IActionResult> UploadToMaster(long batchId, [FromBody] ParameterUploadRequest request)
        {
            try
            {
                if (request == null || string.IsNullOrWhiteSpace(request.UploadedBy))
                {
                    return BadRequest(new
                    {
                        status = "Failed",
                        message = "UploadedBy is required"
                    });
                }

                var result = await _parameterService.UploadToMasterTablesAsync(batchId, request.UploadedBy);

                if (result.Status == "Failed")
                {
                    return BadRequest(result);
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UploadToMaster endpoint");

                return StatusCode(500, new ParameterUploadResponse
                {
                    Status = "Failed",
                    Message = "Internal server error occurred while uploading to master tables",
                    TotalRows = 0,
                    SuccessfulRows = 0,
                    FailedRows = 0,
                    Errors = new List<string> { ex.Message }
                });
            }
        }

    }
}