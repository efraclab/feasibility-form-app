using Dapper;
using InquiryManagementWebService.Models;
using Microsoft.Data.SqlClient;

namespace FeasibilityFormApp.Repositories
{
    public class FeasibilityRepository : IFeasibilityRepository
    {
        private readonly string _connectionString;

        public FeasibilityRepository(IConfiguration configuration)
        {
            _connectionString = configuration["Connnectionstrings:MyConnection"];
        }

        public async Task<IEnumerable<ClientDetail>> GetClientsAsync()
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                var query = @"
                    SELECT 
                        CUSTNAME AS ClientName, 
                        CUSTACCCODE AS ClientCode,
                        CUSTUNIT AS Unit,
                        CUSTADD1 AS Address,
                        CUSTCITY AS City,
                        CUSTPIN AS Pin,
	                    CUSTCONPR1 AS ContactPersonName,
	                    CONTPERSON AS ContactPersonPhone,
	                    CONTEMAIL AS ContactPersonEmail,
	                    CustGstNo AS GstNo
                    FROM OCUSTMST
                ";

                return await connection.QueryAsync<ClientDetail>(query);
            }
        }

        public async Task<IEnumerable<string>> GetSampleTypesAsync()
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                var query = @"
                    select distinct codedesc from ocodemst
                    where codetype = 'CT' and codedesc is not null;
                ";

                return await connection.QueryAsync<string>(query);
            }
        }

        public async Task<IEnumerable<string>> GetRegulationsAsync()
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                var query = @"
                    select distinct RegulationName from Regulation
                    where RegulationName != '-' and RegulationName is not null;
                ";

                return await connection.QueryAsync<string>(query);
            }
        }

        public async Task<IEnumerable<string>> GetMethodsAsync()
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                var query = @"
                    select distinct trn2method from trn205
                    where trn2method is not null;
                ";

                return await connection.QueryAsync<string>(query);
            }
        }

        public async Task<IEnumerable<string>> GetSpecificationsAsync()
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                var query = @"
                    select distinct SpecName from SpecificationMst
                    where SpecName is not null;
                ";

                return await connection.QueryAsync<string>(query);
            }
        }

        public async Task<IEnumerable<string>> GetInstrumentsAsync()
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                var query = @"
                    select distinct Name from INSTRUMENTMASTER
                    where Name is not null;
                ";

                return await connection.QueryAsync<string>(query);
            }
        }

        public async Task<IEnumerable<string>> GetLabsAsync()
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                var query = @"
                    select codedesc from ocodemst
                    where codetype = 'DM' and codedesc is not null;
                ";

                return await connection.QueryAsync<string>(query);
            }
        }

        public async Task<IEnumerable<string>> GetChemicalsAsync()
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                var query = @"
                    select distinct Name from CHEMICALMASTER
                    where Name is not null;
                ";

                return await connection.QueryAsync<string>(query);
            }
        }

        public async Task<IEnumerable<string>> GetColumnsAsync()
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                var query = @"
                    select distinct ColumnName from COLUMNMASTER
                    where ColumnName is not null;
                ";

                return await connection.QueryAsync<string>(query);
            }
        }

        public async Task<IEnumerable<string>> GetStandardsAsync()
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                var query = @"
                    select distinct Name from StandardMaster
                    where Name is not null;
                ";

                return await connection.QueryAsync<string>(query);
            }
        }
    }
}
