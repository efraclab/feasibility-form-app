
using FeasibilityFormApp.Models;

namespace FeasibilityFormApp.Services
{
    public interface IUserService
    {
        Task<string?> LoginAsync(LogInRequest request);
    }
}