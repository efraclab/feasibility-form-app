using InquiryManagementWebService.Models;

namespace FeasibilityFormApp.Repositories
{
    public interface IFeasibilityRepository
    {
        Task<IEnumerable<ClientDetail>> GetClientsAsync();
        Task<IEnumerable<string>> GetSampleTypesAsync();
        Task<IEnumerable<string>> GetRegulationsAsync();
        Task<IEnumerable<string>> GetMethodsAsync();
        Task<IEnumerable<string>> GetSpecificationsAsync();
        Task<IEnumerable<string>> GetInstrumentsAsync();
        Task<IEnumerable<string>> GetLabsAsync();
        Task<IEnumerable<string>> GetChemicalsAsync();
        Task<IEnumerable<string>> GetColumnsAsync();
        Task<IEnumerable<string>> GetStandardsAsync();
    }
}