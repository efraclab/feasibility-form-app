using FeasibilityFormApp.Models;
using FeasibilityFormApp.Services;
using Microsoft.AspNetCore.Mvc;

namespace FeasibilityFormApp.Controllers
{
    [ApiController]
    [Route("api/master")]
    public class MasterController : ControllerBase
    {
        private readonly IMasterService _service;

        public MasterController(IMasterService service)
        {
            _service = service;
        }

        [HttpPost("commodity-details")]
        public async Task<IActionResult> GetCommodityDetails([FromBody] CommodityRequest request)
        {
            var result = await _service.GetCommodityDetailsAsync(request);
            var rows = await _service.GetCommodityDetailsCountAsync(request);
            return Ok(new
            {
                count = rows,
                data = result
            });
        }

        [HttpGet("commodities")]
        public async Task<IActionResult> GetCommodities([FromQuery] string? commodityGroupCode)
        {
            var result = await _service.GetCommoditiesAsync(commodityGroupCode);
            return Ok(result);
        }



        [HttpGet("commodity-groups")]
        public async Task<IActionResult> GetCommodityGroups()
        {
            var result = await _service.GetCommodityGroupsAsync();
            return Ok(result);
        }

        [HttpGet("labs")]
        public async Task<IActionResult> GetLabs()
        {
            var result = await _service.GetLabsAsync();
            return Ok(result);
        }

        [HttpGet("verticals")]
        public async Task<IActionResult> GetVerticals()
        {
            var result = await _service.GetVerticalsAsync();
            return Ok(result);
        }

        [HttpGet("regulations")]
        public async Task<IActionResult> GetRegulations()
        {
            var result = await _service.GetRegulationsAsync();
            return Ok(result);
        }
    }

}
