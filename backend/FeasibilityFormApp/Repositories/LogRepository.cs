using Azure.Core;
using Dapper;
using FeasibilityFormApp.Models;
using Microsoft.Data.SqlClient;

namespace FeasibilityFormApp.Repositories
{

    public class LogRepository : ILogRepository
    {

        private readonly string _connectionString;

        public LogRepository(IConfiguration configuration)
        {
            _connectionString = configuration["Connnectionstrings:MyConnection"];
        }

        public async Task<IEnumerable<Logs>> GetLogsAsync(LogRequest request)
        {
            using var connection = new SqlConnection(_connectionString);

            var offset = (request.PageNumber - 1) * request.PageSize;

            var query = @"
                SELECT
                    u.username AS Username,
                    l.userwrps AS RegNo,
                    FORMAT(l.userdate, 'h:mm tt MMM dd, yyyy') AS Timestamp,
                    l.usersystem AS UserSystem,
                    l.change AS Change,
                    l.add_info AS UpdationInfo
                FROM USERLOG2 l
                JOIN userfile u ON l.userid = u.userid
                WHERE l.add_info IS NOT NULL
                  AND LTRIM(RTRIM(l.add_info)) <> ''
                ORDER BY l.userdate DESC
                OFFSET @Offset ROWS
                FETCH NEXT @PageSize ROWS ONLY;
            ";


            return await connection.QueryAsync<Logs>(query, new
            {
                Offset = offset,
                PageSize = request.PageSize
            });
        }

    }
}
