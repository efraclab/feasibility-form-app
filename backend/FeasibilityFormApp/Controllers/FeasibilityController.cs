using FeasibilityFormApp.Services;
using Microsoft.AspNetCore.Mvc;

namespace FeasibilityFormApp.Controllers
{
    [Route("api/feasibilities")]
    [ApiController]
    public class FeasibilityController : ControllerBase
    {

        private IFeasibilityService _feasibilityService;
        public FeasibilityController(IFeasibilityService feasibilityService)
        {
            _feasibilityService = feasibilityService;
        }

        [HttpGet("clients")]
        public async Task<IActionResult> GetClients()
        {
            try
            {
                var response = await _feasibilityService.GetClientsAsync();
                return Ok(response);
            } 
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("sample-types")]
        public async Task<IActionResult> GetSampleTypes()
        {
            try
            {
                var response = await _feasibilityService.GetSampleTypesAsync();
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("regulations")]
        public async Task<IActionResult> GetRegulations()
        {
            try
            {
                var response = await _feasibilityService.GetRegulationsAsync();
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("methods")]
        public async Task<IActionResult> GetMethods()
        {
            try
            {
                var response = await _feasibilityService.GetMethodsAsync();
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("specifications")]
        public async Task<IActionResult> GetSpecifications()
        {
            try
            {
                var response = await _feasibilityService.GetSpecificationsAsync();
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("instruments")]
        public async Task<IActionResult> GetInstruments()
        {
            try
            {
                var response = await _feasibilityService.GetInstrumentsAsync();
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("labs")]
        public async Task<IActionResult> GetLabs()
        {
            try
            {
                var response = await _feasibilityService.GetLabsAsync();
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("chemicals")]
        public async Task<IActionResult> GetChemicals()
        {
            try
            {
                var response = await _feasibilityService.GetChemicalsAsync();
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("columns")]
        public async Task<IActionResult> GetColumns()
        {
            try
            {
                var response = await _feasibilityService.GetColumnsAsync();
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("standards")]
        public async Task<IActionResult> GetStandards()
        {
            try
            {
                var response = await _feasibilityService.GetStandardsAsync();
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}
