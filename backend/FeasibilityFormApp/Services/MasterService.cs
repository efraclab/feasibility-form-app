using FeasibilityFormApp.Models;
using FeasibilityFormApp.Repositories;
using System.Numerics;

namespace FeasibilityFormApp.Services
{
    public class MasterService : IMasterService
    {
        private readonly IMasterRepository _repository;

        public MasterService(IMasterRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<CommodityDetail>> GetCommodityDetailsAsync(CommodityRequest request)
        {
            return await _repository.GetCommodityDetailsAsync(request);
        }
        public async Task<IEnumerable<long>> GetCommodityDetailsCountAsync(CommodityRequest request)
        {
            return await _repository.GetCommodityDetailsCountAsync(request);
        }

        public async Task<IEnumerable<Commodities>> GetCommoditiesAsync(string CommodityGroupCode)
        {
            return await _repository.GetCommoditiesAsync(CommodityGroupCode);
        }

        public async Task<IEnumerable<CommodityGroups>> GetCommodityGroupsAsync()
        {
            return await _repository.GetCommodityGroupsAsync();
        }

        public async Task<IEnumerable<Labs>> GetLabsAsync()
        {
            return await _repository.GetLabsAsync();
        }

        public async Task<IEnumerable<Verticals>> GetVerticalsAsync()
        {
            return await _repository.GetVerticalsAsync();
        }

        public async Task<IEnumerable<Regulations>> GetRegulationsAsync()
        {
            return await _repository.GetRegulationsAsync();
        }
    }

}
