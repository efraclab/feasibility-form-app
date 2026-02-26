using FeasibilityFormApp.Models;
using FeasibilityFormApp.Repositories;
using FeasibilityFormApp.Utils;

namespace FeasibilityFormApp.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly JwtService _jwtService;

        public UserService(IUserRepository userRepository, JwtService jwtService)
        {
            _userRepository = userRepository;
            _jwtService = jwtService;
        }

        public async Task<string?> LoginAsync(LogInRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.EmployeeId) ||
                string.IsNullOrWhiteSpace(request.Password))
            {
                return null;
            }

            var user = await _userRepository.GetUserAsync(request.EmployeeId);

            if (user == null)
                return null;

            if (user.Password != request.Password)
                return null;

            return _jwtService.GenerateToken(user);
        }

    }
}
