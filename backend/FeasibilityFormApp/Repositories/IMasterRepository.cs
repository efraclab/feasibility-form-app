using FeasibilityFormApp.Models;
using System.Numerics;

namespace FeasibilityFormApp.Repositories
{
    public interface IMasterRepository
    {
        Task<IEnumerable<Commodities>> GetCommoditiesAsync(string CommodityGroupCode);
        Task<IEnumerable<CommodityDetail>> GetCommodityDetailsAsync(CommodityRequest request);
        Task<IEnumerable<Labs>> GetLabsAsync();
        Task<IEnumerable<Regulations>> GetRegulationsAsync();
        Task<IEnumerable<Verticals>> GetVerticalsAsync();
        Task<IEnumerable<CommodityGroups>> GetCommodityGroupsAsync();
        Task<IEnumerable<long>> GetCommodityDetailsCountAsync(CommodityRequest request);
    }
}