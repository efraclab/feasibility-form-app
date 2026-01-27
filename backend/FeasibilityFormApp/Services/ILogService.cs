using FeasibilityFormApp.Models;

namespace FeasibilityFormApp.Services
{
    public interface ILogService
    {
        Task<IEnumerable<Logs>> GetLogsAsync(LogRequest request);
    }
}