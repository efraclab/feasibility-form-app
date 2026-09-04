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

            // ------------------------------------------------------------
            // HARD-CODED REVIEWER ACCOUNT
            // ------------------------------------------------------------
            // Reviewer is intentionally application-level and does not need
            // USERFILE / USER_ROLE_REL / ROLE_MAST records.
            if (string.Equals(
                    request.EmployeeId.Trim(),
                    "reviewer1",
                    StringComparison.OrdinalIgnoreCase))
            {
                if (request.Password != "reviewer1")
                    return null;

                var reviewer = new User
                {
                    EmployeeId = "reviewer1",
                    Username = "Reviewer 1",
                    Password = "reviewer1",
                    RoleCode = "REVIEWER",
                    Role = "Reviewer",
                    Department = "REVIEW"
                };

                return _jwtService.GenerateToken(reviewer);
            }

            // ------------------------------------------------------------
            // HARD-CODED ADMIN ACCOUNT
            // ------------------------------------------------------------
            if (string.Equals(
                    request.EmployeeId.Trim(),
                    "admin",
                    StringComparison.OrdinalIgnoreCase))
            {
                if (request.Password != "admin0090")
                    return null;

                var admin = new User
                {
                    EmployeeId = "admin",
                    Username = "Admin",
                    Password = "admin0090",
                    RoleCode = "ADMIN",
                    Role = "Admin",
                    Department = "ADMIN"
                };

                return _jwtService.GenerateToken(admin);
            }

            // ------------------------------------------------------------
            // DATABASE USERS: QUOTATION / LAB
            // ------------------------------------------------------------
            var user = await _userRepository.GetUserAsync(request.EmployeeId);

            if (user == null)
                return null;

            if (user.Password != request.Password)
                return null;

            return _jwtService.GenerateToken(user);
        }

    }
}
