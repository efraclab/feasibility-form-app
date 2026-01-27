using FeasibilityFormApp.Models;
using FeasibilityFormApp.Services;
using Microsoft.AspNetCore.Mvc;

namespace FeasibilityFormApp.Controllers
{

    [ApiController]
    [Route("api/logs")]
    public class LogController : Controller
    {

        private ILogService _logService;

        public LogController(ILogService logService)
        {
            _logService = logService;
        }

        [HttpPost]
        public async Task<IActionResult> GetLogs([FromBody] LogRequest request)
        {
            var result = await _logService.GetLogsAsync(request);
            return Ok(result);
        }

    }
}
