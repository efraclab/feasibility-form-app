using Dapper;
using FeasibilityFormApp.Models;
using Microsoft.Data.SqlClient;

namespace FeasibilityFormApp.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly string _connectionString;

        public UserRepository(IConfiguration configuration)
        {
            _connectionString = configuration["Connnectionstrings:MyConnection"]
                ?? throw new InvalidOperationException(
                    "Database connection string 'Connnectionstrings:MyConnection' was not found."
                );
        }

        public async Task<User?> GetUserAsync(string employeeId)
        {
            const string query = @"
                SELECT TOP 1
                    U.USERLOGINID AS [EmployeeId],
                    U.USERNAME AS [Username],
                    U.USERPSWD AS [Password],
                    U.USERDEPT AS [Department],
                    R.ROLE_CODE AS [RoleCode],
                    R.ROLE_NAME AS [Role]
                FROM [Efrac_Lims_2025].[dbo].[USERFILE] U

                INNER JOIN [Efrac_Lims_2025].[dbo].[USER_ROLE_REL] UR
                    ON U.USERID = UR.USERID

                INNER JOIN [Efrac_Lims_2025].[dbo].[ROLE_MAST] R
                    ON UR.ROLE_CODE = R.ROLE_CODE

                WHERE 
                    U.USERLOGINID = @EmployeeId
                    AND R.ROLE_CODE IN ('ROLE000006', 'ROLE000007', 'ROLE000008', 'ROLE000020')

                ORDER BY U.USERNAME;
            ";

            await using var connection = new SqlConnection(_connectionString);

            return await connection.QueryFirstOrDefaultAsync<User>(
                query,
                new
                {
                    EmployeeId = employeeId
                }
            );
        }
    }
}