using FeasibilityFormApp.Repositories;
using InquiryManagementWebService.Models;

namespace FeasibilityFormApp.Services
{
    public class FeasibilityService : IFeasibilityService
    {

        private readonly IFeasibilityRepository _feasibilityRepository;


        public FeasibilityService(IFeasibilityRepository feasibilityRepository)
        {
            _feasibilityRepository = feasibilityRepository;
        }

        public async Task<IEnumerable<ClientDetail>> GetClientsAsync()
        {
            return await _feasibilityRepository.GetClientsAsync();
        }

        public async Task<IEnumerable<string>> GetSampleTypesAsync()
        {
            return await _feasibilityRepository.GetSampleTypesAsync();
        }

        public async Task<IEnumerable<string>> GetRegulationsAsync()
        {
            return await _feasibilityRepository.GetRegulationsAsync();
        }

        public async Task<IEnumerable<string>> GetMethodsAsync()
        {
            return await _feasibilityRepository.GetMethodsAsync();
        }

        public async Task<IEnumerable<string>> GetSpecificationsAsync()
        {
            return await _feasibilityRepository.GetSpecificationsAsync();
        }

        public async Task<IEnumerable<string>> GetInstrumentsAsync()
        {
            return await _feasibilityRepository.GetInstrumentsAsync();
        }

        public async Task<IEnumerable<string>> GetLabsAsync()
        {
            return await _feasibilityRepository.GetLabsAsync();
        }

        public async Task<IEnumerable<string>> GetChemicalsAsync()
        {
            return await _feasibilityRepository.GetChemicalsAsync();
        }

        public async Task<IEnumerable<string>> GetColumnsAsync()
        {
            return await _feasibilityRepository.GetColumnsAsync();
        }

        public async Task<IEnumerable<string>> GetStandardsAsync()
        {
            return await _feasibilityRepository.GetStandardsAsync();
        }
    }
}
