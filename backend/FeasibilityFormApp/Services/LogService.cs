using FeasibilityFormApp.Models;
using FeasibilityFormApp.Repositories;

namespace FeasibilityFormApp.Services
{
    public class LogService : ILogService
    {
        private readonly ILogRepository _logRepository;

        public LogService(ILogRepository logRepository)
        {
            _logRepository = logRepository;
        }


        public async Task<IEnumerable<Logs>> GetLogsAsync(LogRequest request)
        {
            return await _logRepository.GetLogsAsync(request);
        }
    }
}
