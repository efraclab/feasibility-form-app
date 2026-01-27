using FeasibilityFormApp.Models;

namespace FeasibilityFormApp.Repositories
{
    public interface ILogRepository
    {
        Task<IEnumerable<Logs>> GetLogsAsync(LogRequest request);
    }
}