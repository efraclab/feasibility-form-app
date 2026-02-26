using FeasibilityFormApp.Models;

namespace FeasibilityFormApp.Repositories
{
    public interface IUserRepository
    {
        Task<User?> GetUserAsync(string employeeId);
    }
}