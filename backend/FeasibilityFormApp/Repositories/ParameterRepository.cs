using Dapper;
using FeasibilityFormApp.Models;
using Microsoft.Data.SqlClient;

namespace FeasibilityFormApp.Repositories
{
    public class ParameterRepository: IParameterRepository
    {
        private readonly string _connectionString;

        public string DEFAULT_PLANT_CODE = "P001";

        public ParameterRepository(IConfiguration configuration)
        {
            _connectionString = configuration["Connnectionstrings:TestConnection"];
        }

        public async Task<ParameterUploadResponse> BulkInsertParametersAsync(ParameterUploadRequest request)
        {
            using var connection = new SqlConnection(_connectionString);

            try
            {
                await connection.OpenAsync();
                using var transaction = connection.BeginTransaction();

                var totalRows = request.Parameters.Count;
                var successfulRows = 0;
                var failedRows = 0;
                var errors = new List<string>();

                var batchId = await connection.ExecuteScalarAsync<long>(
                    @"SELECT ISNULL(MAX(BatchId), 0) + 1 FROM ParameterMasterBuffer",
                    transaction: transaction
                );

                var insertQuery = @"
INSERT INTO ParameterMasterBuffer (
    BatchId,
    ParameterName, ParameterCode,
    ParameterGroup, ParameterGroupCode,
    ParameterSubGroup, ParameterSubGroupCode,
    CommodityName, CommodityCode,
    CommodityGroup, CommodityGroupCode,
    NonFssaiFssaiDrug, NonFssaiFssaiDrugCode,
    RegulationName, RegulationCode,
    ParameterLabDistribution, LabCode,
    TatDays, ParameterSequence, OutsourceYN,
    SampleQuantityAnalysis, SampleQuantityRetention,
    RequiredSampleQuantityUnit, UnitCode,
    NablScopeStatus,
    MethodName, MethodCode,
    SpecificationName, SpecificationCode,
    FssaiCategoryNo, SubClause,
    TestUnit, TestCode,
    Instrument, Loq,
    ParameterIndividualRate, RegulatoryRateDrug,
    AddInfo, UploadedBy
)
SELECT
    @BatchId,

    COALESCE(
        NULLIF(@ParameterName,''),
        (SELECT TOP 1 headdesc FROM OHEADMST WHERE headcd = @ParameterCode)
    ),

    COALESCE(
        NULLIF(@ParameterCode,''),
        (SELECT TOP 1 headcd FROM OHEADMST WHERE headdesc = @ParameterName)
    ),

    COALESCE(
        NULLIF(@ParameterGroup,''),
        (SELECT TOP 1 CODEDESC FROM OCODEMST 
         WHERE CODECD = @ParameterGroupCode AND CODETYPE='GM')
    ),

    COALESCE(
        NULLIF(@ParameterGroupCode,''),
        (SELECT TOP 1 CODECD FROM OCODEMST 
         WHERE CODEDESC = @ParameterGroup AND CODETYPE='GM')
    ),

    COALESCE(
        NULLIF(@ParameterSubGroup,''),
        (SELECT TOP 1 CODEDESC FROM OCODEMST 
         WHERE CODECD = @ParameterSubGroupCode AND CODETYPE='SG')
    ),

    COALESCE(
        NULLIF(@ParameterSubGroupCode,''),
        (SELECT TOP 1 CODECD FROM OCODEMST 
         WHERE CODEDESC = @ParameterSubGroup AND CODETYPE='SG')
    ),

    COALESCE(
        NULLIF(@CommodityName,''),
        (SELECT TOP 1 CatagoryName 
         FROM CatagoryMST WHERE CatagoryCode = @CommodityCode)
    ),

    COALESCE(
        NULLIF(@CommodityCode,''),
        (SELECT TOP 1 CatagoryCode 
         FROM CatagoryMST WHERE CatagoryName = @CommodityName)
    ),

    COALESCE(
        NULLIF(@CommodityGroup,''),
        (SELECT TOP 1 CommodityGroupName 
         FROM CommodityGroup 
         WHERE CommodityGroupCode = @CommodityGroupCode)
    ),

    COALESCE(
        NULLIF(@CommodityGroupCode,''),
        (SELECT TOP 1 CommodityGroupCode 
         FROM CommodityGroup 
         WHERE CommodityGroupName = @CommodityGroup)
    ),

    @NonFssaiFssaiDrug,

    @NonFssaiFssaiDrugCode,

    COALESCE(
        NULLIF(@RegulationName,''),
        (SELECT TOP 1 RegulationName 
         FROM Regulation WHERE RegulationCode = @RegulationCode)
    ),

    COALESCE(
        NULLIF(@RegulationCode,''),
        (SELECT TOP 1 RegulationCode 
         FROM Regulation WHERE RegulationName = @RegulationName)
    ),

    COALESCE(
        NULLIF(@ParameterLabDistribution,''),
        (SELECT TOP 1 CODEDESC 
         FROM OCODEMST 
         WHERE CODECD = @LabCode AND CODETYPE='DM')
    ),

    COALESCE(
        NULLIF(@LabCode,''),
        (SELECT TOP 1 CODECD 
         FROM OCODEMST 
         WHERE CODEDESC = @ParameterLabDistribution AND CODETYPE='DM')
    ),

    @TatDays,
    @ParameterSequence,
    @OutsourceYN,
    @SampleQuantityAnalysis,
    @SampleQuantityRetention,
    @RequiredSampleQuantityUnit,
    @UnitCode,
    @NablScopeStatus,

    COALESCE(
        NULLIF(@MethodName,''),
        (SELECT TOP 1 headmethod 
         FROM OHEADMST 
         WHERE headcd = @ParameterCode)
    ),

    COALESCE(
        NULLIF(@MethodCode,''),
        (SELECT TOP 1 SpecMethodCd 
         FROM SpecificationMst 
         WHERE SpecName = @SpecificationName)
    ),

    COALESCE(
        NULLIF(@SpecificationName,''),
        (SELECT TOP 1 SpecName 
         FROM SpecificationMst 
         WHERE SpecCode = @SpecificationCode)
    ),

    COALESCE(
        NULLIF(@SpecificationCode,''),
        (SELECT TOP 1 SpecCode 
         FROM SpecificationMst 
         WHERE SpecName = @SpecificationName)
    ),

    @FssaiCategoryNo,
    @SubClause,
    @TestUnit,
    @TestCode,
    @Instrument,
    @Loq,
    @ParameterIndividualRate,
    @RegulatoryRateDrug,
    @AddInfo,
    @UploadedBy;
";


                foreach (var param in request.Parameters)
                {
                    try
                    {
                        await connection.ExecuteAsync(
                            insertQuery,
                            new
                            {
                                BatchId = batchId,
                                param.ParameterName,
                                param.ParameterCode,
                                param.ParameterGroup,
                                param.ParameterGroupCode,
                                param.ParameterSubGroup,
                                param.ParameterSubGroupCode,
                                param.CommodityName,
                                param.CommodityCode,
                                param.CommodityGroup,
                                param.CommodityGroupCode,
                                param.NonFssaiFssaiDrug,
                                param.NonFssaiFssaiDrugCode,
                                param.RegulationName,
                                param.RegulationCode,
                                param.ParameterLabDistribution,
                                param.LabCode,
                                param.TatDays,
                                param.ParameterSequence,
                                param.OutsourceYN,
                                param.SampleQuantityAnalysis,
                                param.SampleQuantityRetention,
                                param.RequiredSampleQuantityUnit,
                                param.UnitCode,
                                param.NablScopeStatus,
                                param.MethodName,
                                param.MethodCode,
                                param.SpecificationName,
                                param.SpecificationCode,
                                param.FssaiCategoryNo,
                                param.SubClause,
                                param.TestUnit,
                                param.TestCode,
                                param.Instrument,
                                param.Loq,
                                param.ParameterIndividualRate,
                                param.RegulatoryRateDrug,
                                param.AddInfo,
                                request.UploadedBy
                            },
                            transaction: transaction,
                            commandTimeout: 300
                        );

                        successfulRows++;
                    }
                    catch (Exception ex)
                    {
                        failedRows++;
                        errors.Add($"Row {successfulRows + failedRows}: {ex.Message}");
                    }
                }

                var logId = await connection.ExecuteScalarAsync<long>(
                    @"
                    INSERT INTO ParameterUploadBufferLog (
                        BatchId, FileName, TotalRows, SuccessfulRows,
                        FailedRows, UploadedBy, Status, ErrorMessage
                    )
                    OUTPUT INSERTED.Id
                    VALUES (
                        @BatchId, @FileName, @TotalRows, @SuccessfulRows,
                        @FailedRows, @UploadedBy, @Status, @ErrorMessage
                    )",
                    new
                    {
                        BatchId = batchId,
                        request.FileName,
                        TotalRows = totalRows,
                        SuccessfulRows = successfulRows,
                        FailedRows = failedRows,
                        request.UploadedBy,
                        Status = failedRows == 0 ? "Success"
                               : successfulRows > 0 ? "Partial" : "Failed",
                        ErrorMessage = errors.Any()
                            ? string.Join("; ", errors.Take(10))
                            : null
                    },
                    transaction
                );

                transaction.Commit();

                return new ParameterUploadResponse
                {
                    UploadLogId = logId,
                    TotalRows = totalRows,
                    SuccessfulRows = successfulRows,
                    FailedRows = failedRows,
                    Status = failedRows == 0 ? "Success"
                           : successfulRows > 0 ? "Partial" : "Failed",
                    Message = $"Batch {batchId} uploaded successfully",
                    Errors = errors
                };
            }
            catch (Exception ex)
            {
                return new ParameterUploadResponse
                {
                    Status = "Failed",
                    Message = "Upload failed",
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        public async Task UpdateParameterAsync(ParameterMaster param, string? updatedBy, string? reviewedBy, string? remarks)
        {
            using var connection = new SqlConnection(_connectionString);

            var query = @"
                UPDATE ParameterMasterBuffer
                SET
                    ParameterName = @ParameterName,
                    ParameterCode = @ParameterCode,
                    ParameterGroup = @ParameterGroup,
                    ParameterGroupCode = @ParameterGroupCode,
                    ParameterSubGroup = @ParameterSubGroup,
                    ParameterSubGroupCode = @ParameterSubGroupCode,
                    CommodityName = @CommodityName,
                    CommodityCode = @CommodityCode,
                    CommodityGroup = @CommodityGroup,
                    CommodityGroupCode = @CommodityGroupCode,
                    NonFssaiFssaiDrug = @NonFssaiFssaiDrug,
                    NonFssaiFssaiDrugCode = @NonFssaiFssaiDrugCode,
                    RegulationName = @RegulationName,
                    RegulationCode = @RegulationCode,
                    ParameterLabDistribution = @ParameterLabDistribution,
                    LabCode = @LabCode,
                    TatDays = @TatDays,
                    ParameterSequence = @ParameterSequence,
                    OutsourceYN = @OutsourceYN,
                    SampleQuantityAnalysis = @SampleQuantityAnalysis,
                    SampleQuantityRetention = @SampleQuantityRetention,
                    RequiredSampleQuantityUnit = @RequiredSampleQuantityUnit,
                    UnitCode = @UnitCode,
                    NablScopeStatus = @NablScopeStatus,
                    MethodName = @MethodName,
                    MethodCode = @MethodCode,
                    SpecificationName = @SpecificationName,
                    SpecificationCode = @SpecificationCode,
                    FssaiCategoryNo = @FssaiCategoryNo,
                    SubClause = @SubClause,
                    TestUnit = @TestUnit,
                    TestCode = @TestCode,
                    Instrument = @Instrument,
                    Loq = @Loq,
                    ParameterIndividualRate = @ParameterIndividualRate,
                    RegulatoryRateDrug = @RegulatoryRateDrug,
                    AddInfo = @AddInfo,
                    Status = @Status,

                    ReviewedAt = CASE
                        WHEN ISNULL(ReviewedBy, '') <> ISNULL(@ReviewedBy, '')
                        THEN GETDATE()
                        ELSE ReviewedAt
                    END,

                    ReviewedBy = CASE
                        WHEN ISNULL(ReviewedBy, '') <> ISNULL(@ReviewedBy, '')
                        THEN @ReviewedBy
                        ELSE ReviewedBy
                    END,

                    Remarks = @Remarks,

                    LastUpdatedAt = CASE
                        WHEN ISNULL(ReviewedBy, '') = ISNULL(@ReviewedBy, '')
                        THEN GETDATE()
                        ELSE LastUpdatedAt
                    END,

                    LastUpdatedBy = CASE
                        WHEN ISNULL(ReviewedBy, '') = ISNULL(@ReviewedBy, '')
                        THEN @UpdatedBy
                        ELSE LastUpdatedBy
                    END

                WHERE Id = @Id;
                ";

            var rows = await connection.ExecuteAsync(query, new
            {
                param.Id,
                param.ParameterName,
                param.ParameterCode,
                param.ParameterGroup,
                param.ParameterGroupCode,
                param.ParameterSubGroup,
                param.ParameterSubGroupCode,
                param.CommodityName,
                param.CommodityCode,
                param.CommodityGroup,
                param.CommodityGroupCode,
                param.NonFssaiFssaiDrug,
                param.NonFssaiFssaiDrugCode,
                param.RegulationName,
                param.RegulationCode,
                param.ParameterLabDistribution,
                param.LabCode,
                param.TatDays,
                param.ParameterSequence,
                param.OutsourceYN,
                param.SampleQuantityAnalysis,
                param.SampleQuantityRetention,
                param.RequiredSampleQuantityUnit,
                param.UnitCode,
                param.NablScopeStatus,
                param.MethodName,
                param.MethodCode,
                param.SpecificationName,
                param.SpecificationCode,
                param.FssaiCategoryNo,
                param.SubClause,
                param.TestUnit,
                param.TestCode,
                param.Instrument,
                param.Loq,
                param.ParameterIndividualRate,
                param.RegulatoryRateDrug,
                param.AddInfo,
                param.Status,
                UpdatedBy = updatedBy,
                ReviewedBy = reviewedBy,
                Remarks = remarks,
            });

        }


        public async Task<IEnumerable<ParameterUploadLog>> GetUploadLogsAsync(int pageNumber = 1, int pageSize = 10)
        {
            using var connection = new SqlConnection(_connectionString);

            var offset = (pageNumber - 1) * pageSize;

            var query = @"
                SELECT 
                    Id,
                    BatchId,
                    FileName,
                    TotalRows,
                    SuccessfulRows,
                    FailedRows,
                    UploadedBy,
                    UploadedAt,
                    Status,
                    ErrorMessage
                FROM ParameterUploadBufferLog
                ORDER BY UploadedAt DESC
                OFFSET @Offset ROWS
                FETCH NEXT @PageSize ROWS ONLY;
            ";

            return await connection.QueryAsync<ParameterUploadLog>(query, new
            {
                Offset = offset,
                PageSize = pageSize
            });
        }

        public async Task<IEnumerable<ParameterMaster>> GetParametersAsync(
         string employeeId,
         string role,
         string searchTerm = null,
         int pageNumber = 1,
         int pageSize = 50)
        {
            using var connection = new SqlConnection(_connectionString);

            var offset = (pageNumber - 1) * pageSize;

            var query = @"
        SELECT *
        FROM ParameterMasterBuffer
        WHERE
            (
                @SearchTerm IS NULL OR @SearchTerm = ''
                OR ParameterName LIKE '%' + @SearchTerm + '%'
                OR ParameterCode LIKE '%' + @SearchTerm + '%'
                OR CommodityName LIKE '%' + @SearchTerm + '%'
            )
            AND
            (
                @IsCrm = 1
                OR UploadedBy = @EmployeeId
            )
        ORDER BY Id ASC
        OFFSET @Offset ROWS
        FETCH NEXT @PageSize ROWS ONLY;
    ";

            return await connection.QueryAsync<ParameterMaster>(query, new
            {
                SearchTerm = searchTerm,
                EmployeeId = employeeId,
                IsCrm = role != null && role.Contains("crm", StringComparison.OrdinalIgnoreCase),
                Offset = offset,
                PageSize = pageSize
            });
        }

        public async Task<ParameterUploadResponse> UploadToMasterTablesAsync(long batchId, string uploadedBy)
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();
            using var transaction = connection.BeginTransaction();

            try
            {
                // Get approved parameters
                var bufferParameters = (await connection.QueryAsync<ParameterMaster>(
                    @"SELECT * FROM ParameterMasterBuffer 
              WHERE BatchId = @BatchId AND Status = 'Approved'",
                    new { BatchId = batchId },
                    transaction
                )).ToList();

                if (!bufferParameters.Any())
                {
                    throw new Exception("No approved parameters found for this batch.");
                }

                foreach (var param in bufferParameters)
                {
                    // If any of these throws → entire transaction rolls back
                    await InsertCommodityGroupAsync(connection, transaction, param, uploadedBy);
                    await InsertCategoryMasterAsync(connection, transaction, param, uploadedBy);
                    await InsertOHeadBasicAsync(connection, transaction, param, uploadedBy);
                    await InsertSpecificationMasterAsync(connection, transaction, param, uploadedBy);
                    await InsertParameterHeadMasterAsync(connection, transaction, param, uploadedBy);
                    await InsertRegulationAsync(connection, transaction, param, uploadedBy);
                    await InsertCategoryParameterAsync(connection, transaction, param, uploadedBy);

                    await connection.ExecuteAsync(
                        @"UPDATE ParameterMasterBuffer 
                  SET Status = 'Uploaded', 
                      LastUpdatedAt = GETDATE(),
                      LastUpdatedBy = @UploadedBy
                  WHERE Id = @Id",
                        new { param.Id, UploadedBy = uploadedBy },
                        transaction
                    );
                }

                // Update batch log as Uploaded
                await connection.ExecuteAsync(
                    @"UPDATE ParameterUploadBufferLog 
              SET Status = 'Uploaded',
                  ErrorMessage = NULL
              WHERE BatchId = @BatchId",
                    new { BatchId = batchId },
                    transaction
                );

                transaction.Commit();

                return new ParameterUploadResponse
                {
                    UploadLogId = batchId,
                    TotalRows = bufferParameters.Count,
                    SuccessfulRows = bufferParameters.Count,
                    FailedRows = 0,
                    Status = "Success",
                    Message = $"All {bufferParameters.Count} parameters uploaded successfully."
                };
            }
            catch (Exception ex)
            {
                transaction.Rollback();

                await connection.ExecuteAsync(
                    @"UPDATE ParameterUploadBufferLog 
                      SET Status = 'Failed',
                          ErrorMessage = @ErrorMessage
                      WHERE BatchId = @BatchId",
                    new
                    {
                        BatchId = batchId,
                        ErrorMessage = ex.Message
                    });

                throw new Exception($"Upload to master tables failed. {ex.Message}", ex);
            }
        }


        private async Task InsertCategoryMasterAsync(
            SqlConnection connection,
            SqlTransaction transaction,
            ParameterMaster param,
            string uploadedBy)
        {
            // Check if category already exists
            var exists = await connection.ExecuteScalarAsync<bool>(
                @"SELECT CASE WHEN EXISTS(
                    SELECT 1 FROM CatagoryMST 
                    WHERE CatagoryCode = @CommodityCode
                  ) THEN 1 ELSE 0 END",
                new { param.CommodityCode },
                transaction
            );

            if (!exists && !string.IsNullOrWhiteSpace(param.CommodityCode))
            {
                await connection.ExecuteAsync(
                    @"INSERT INTO CatagoryMST (
                        CatagoryPlant, CatagoryCode, CatagoryName, 
                        CatagoryGroupCode, UploadDate, Visibility, UploadBy
                      ) VALUES (
                        @Plant, @CommodityCode, @CommodityName, 
                        @CommodityGroupCode, GETDATE(), 'Y', @UploadedBy
                      )",
                    new
                    {
                        Plant = DEFAULT_PLANT_CODE,
                        param.CommodityCode,
                        param.CommodityName,
                        param.CommodityGroupCode,
                        UploadedBy = uploadedBy
                    },
                    transaction
                );
            }
        }

        private async Task InsertCommodityGroupAsync(
            SqlConnection connection,
            SqlTransaction transaction,
            ParameterMaster param,
            string uploadedBy)
        {
            var exists = await connection.ExecuteScalarAsync<bool>(
                @"SELECT CASE WHEN EXISTS(
                    SELECT 1 FROM CommodityGroup 
                    WHERE CommodityGroupCode = @CommodityGroupCode
                  ) THEN 1 ELSE 0 END",
                new { param.CommodityGroupCode },
                transaction
            );

            if (!exists && !string.IsNullOrWhiteSpace(param.CommodityGroupCode))
            {
                await connection.ExecuteAsync(
                    @"INSERT INTO CommodityGroup (
                        CommoditygroupPlant, CommodityGroupCode, CommodityGroupName,
                        Visibility, UploadDate, UploadBy
                      ) VALUES (
                        @Plant, @CommodityGroupCode, @CommodityGroupName,
                        'Y', GETDATE(), @UploadedBy
                      )",
                    new
                    {
                        Plant = DEFAULT_PLANT_CODE,
                        param.CommodityGroupCode,
                        CommodityGroupName = param.CommodityGroup,
                        UploadedBy = uploadedBy
                    },
                    transaction
                );
            }
        }

        private async Task InsertOHeadBasicAsync(
            SqlConnection connection,
            SqlTransaction transaction,
            ParameterMaster param,
            string uploadedBy)
        {
            // Truncate ParameterCode to 6 characters for headcd field
            var headCode = string.IsNullOrWhiteSpace(param.ParameterCode) ? null :
                          (param.ParameterCode.Length > 6 ? param.ParameterCode.Substring(0, 6) : param.ParameterCode);

            // Check if OHEADBasic entry already exists
            var exists = await connection.ExecuteScalarAsync<bool>(
                @"SELECT CASE WHEN EXISTS(
                    SELECT 1 FROM OHEADBasic 
                    WHERE headcd = @HeadCode
                  ) THEN 1 ELSE 0 END",
                new { HeadCode = headCode },
                transaction
            );

            if (!exists && !string.IsNullOrWhiteSpace(headCode))
            {
                await connection.ExecuteAsync(
                    @"INSERT INTO OHEADBasic (
                        headcd, headdesc, headaliasdesc,
                        Visibility, UploadDate, UploadBy
                      ) VALUES (
                        @HeadCode, @ParameterName, @ParameterName,
                        'Y', GETDATE(), @UploadedBy
                      )",
                    new
                    {
                        HeadCode = headCode,
                        param.ParameterName,
                        UploadedBy = uploadedBy
                    },
                    transaction
                );
            }
        }

        private async Task InsertSpecificationMasterAsync(
            SqlConnection connection,
            SqlTransaction transaction,
            ParameterMaster param,
            string uploadedBy)
        {
            // Check if specification already exists
            var exists = await connection.ExecuteScalarAsync<bool>(
                @"SELECT CASE WHEN EXISTS(
                    SELECT 1 FROM SpecificationMst 
                    WHERE SpecCode = @SpecificationCode
                  ) THEN 1 ELSE 0 END",
                new { param.SpecificationCode },
                transaction
            );

            if (!exists && !string.IsNullOrWhiteSpace(param.SpecificationCode))
            {
                await connection.ExecuteAsync(
                    @"INSERT INTO SpecificationMst (
                        SpecPlantCd, SpecHeadCd, SpecMethodCd, SpecCode, SpecName,
                        SpecCommodityCd, SpecCommodityGroupCode, SpecLOQ, 
                        UploadDate, ADD_INFO
                      ) VALUES (
                        @Plant, @ParameterCode, @MethodCode, @SpecificationCode, @SpecificationName,
                        @CommodityCode, @CommodityGroupCode, @Loq, 
                        GETDATE(), @AddInfo
                      )",
                    new
                    {
                        Plant = DEFAULT_PLANT_CODE,
                        ParameterCode = string.IsNullOrWhiteSpace(param.ParameterCode) ? null :
                                       (param.ParameterCode.Length > 6 ? param.ParameterCode.Substring(0, 6) : param.ParameterCode),
                        param.MethodCode,
                        param.SpecificationCode,
                        param.SpecificationName,
                        param.CommodityCode,
                        param.CommodityGroupCode,
                        param.Loq,
                        param.AddInfo
                    },
                    transaction
                );
            }
        }

        private async Task InsertParameterHeadMasterAsync(
            SqlConnection connection,
            SqlTransaction transaction,
            ParameterMaster param,
            string uploadedBy)
        {
            // Truncate ParameterCode to 6 characters for headcd field
            var headCode = string.IsNullOrWhiteSpace(param.ParameterCode) ? null :
                          (param.ParameterCode.Length > 6 ? param.ParameterCode.Substring(0, 6) : param.ParameterCode);

            // Check if parameter head already exists
            var exists = await connection.ExecuteScalarAsync<bool>(
                @"SELECT CASE WHEN EXISTS(
                    SELECT 1 FROM OHEADMST 
                    WHERE headPlantCd = @Plant AND headcd = @HeadCode
                  ) THEN 1 ELSE 0 END",
                new { Plant = DEFAULT_PLANT_CODE, HeadCode = headCode },
                transaction
            );

            if (!exists && !string.IsNullOrWhiteSpace(headCode))
            {
                // Convert LAB DISTRIBUTION to single character code
                string headTestTy = null;
                if (!string.IsNullOrWhiteSpace(param.ParameterLabDistribution))
                {
                    var labDist = param.ParameterLabDistribution.ToUpper();
                    if (labDist.Contains("FDS")) headTestTy = "F";
                    else if (labDist.Contains("MT")) headTestTy = "M";
                    else if (labDist.Contains("RA")) headTestTy = "R";
                    else if (labDist.Contains("MB")) headTestTy = "B";
                    else if (labDist.Contains("WTR")) headTestTy = "W";
                    else if (labDist.Contains("ENV")) headTestTy = "E";
                    else if (labDist.Contains("GAS")) headTestTy = "G";
                }

                await connection.ExecuteAsync(
                    @"INSERT INTO OHEADMST (
                        headPlantCd, headcd, headdesc, headmethod,
                        headtestty, headTAT, headQty, headQtyReq, headQtyReqRetn, headGroupQty,
                        headLOQ, headInstNo, headRate, PrintSequence,
                        headUnit, HEADGROUP, HeadDepartment,
                        UploadDate, Visibility, UploadBy
                      ) VALUES (
                        @Plant, @HeadCode, @ParameterName, @MethodName,
                        @HeadTestTy, @TatDays, @SampleQuantityAnalysis, @SampleQuantityAnalysis, @SampleQuantityRetention, @RequiredSampleQuantityUnit,
                        @Loq, @Instrument, @ParameterIndividualRate, @ParameterSequence,
                        @TestUnit, @ParameterGroupCode, @LabCode,
                        GETDATE(), 'Y', @UploadedBy
                      )",
                    new
                    {
                        Plant = DEFAULT_PLANT_CODE,
                        HeadCode = headCode,
                        param.ParameterName,
                        param.MethodName,
                        HeadTestTy = headTestTy,
                        param.TatDays,
                        param.SampleQuantityAnalysis,
                        param.SampleQuantityRetention,
                        param.RequiredSampleQuantityUnit,
                        param.Loq,
                        param.Instrument,
                        param.ParameterIndividualRate,
                        param.ParameterSequence,
                        param.TestUnit,
                        param.ParameterGroupCode,
                        param.LabCode,
                        UploadedBy = uploadedBy
                    },
                    transaction
                );
            }
        }

        private async Task InsertRegulationAsync(
            SqlConnection connection,
            SqlTransaction transaction,
            ParameterMaster param,
            string uploadedBy)
        {
            // Truncate ParameterCode to 6 characters for RegParameter field
            var regParameter = string.IsNullOrWhiteSpace(param.ParameterCode) ? null :
                              (param.ParameterCode.Length > 6 ? param.ParameterCode.Substring(0, 6) : param.ParameterCode);

            // Check if regulation entry already exists
            var exists = await connection.ExecuteScalarAsync<bool>(
                @"SELECT CASE WHEN EXISTS(
                    SELECT 1 FROM Regulation 
                    WHERE RegulationCode = @RegulationCode 
                      AND CommodityCode = @CommodityCode
                      AND RegParameter = @RegParameter
                  ) THEN 1 ELSE 0 END",
                new
                {
                    param.RegulationCode,
                    param.CommodityCode,
                    RegParameter = regParameter
                },
                transaction
            );

            if (!exists && !string.IsNullOrWhiteSpace(param.RegulationCode))
            {
                // Truncate parameter name to 10 characters for RegCommodityParameterN
                var regCommodityParamN = string.IsNullOrWhiteSpace(param.NonFssaiFssaiDrugCode) ? null :
                                        (param.NonFssaiFssaiDrugCode.Length > 10 ?
                                         param.NonFssaiFssaiDrugCode.Substring(0, 10) :
                                         param.NonFssaiFssaiDrugCode);

                await connection.ExecuteAsync(
                    @"INSERT INTO Regulation (
                        RegPlant, RegulationCode, CommodityCode, RegParameter,
                        RegulationName, ParameterGroupCode, CommodityGroupCode,
                        RegParameterGroupRate, RegCommodityParameterN, UploadDate, ADD_INFO
                      ) VALUES (
                        @Plant, @RegulationCode, @CommodityCode, @RegParameter,
                        @RegulationName, @ParameterGroupCode, @CommodityGroupCode,
                        @RegulatoryRateDrug, @RegCommodityParameterN, GETDATE(), @AddInfo
                      )",
                    new
                    {
                        Plant = DEFAULT_PLANT_CODE,
                        param.RegulationCode,
                        param.CommodityCode,
                        RegParameter = regParameter,
                        param.RegulationName,
                        param.ParameterGroupCode,
                        param.CommodityGroupCode,
                        param.RegulatoryRateDrug,
                        RegCommodityParameterN = regCommodityParamN,
                        param.AddInfo
                    },
                    transaction
                );
            }
        }

        private async Task InsertCategoryParameterAsync(
            SqlConnection connection,
            SqlTransaction transaction,
            ParameterMaster param,
            string uploadedBy)
        {
            // Truncate ParameterCode to 6 characters
            var parameterCd = string.IsNullOrWhiteSpace(param.ParameterCode) ? null :
                             (param.ParameterCode.Length > 6 ? param.ParameterCode.Substring(0, 6) : param.ParameterCode);

            // Check if category-parameter link already exists
            var exists = await connection.ExecuteScalarAsync<bool>(
                @"SELECT CASE WHEN EXISTS(
                    SELECT 1 FROM CATAGORY_PARAMETER 
                    WHERE CatagoryCD = @CommodityCode 
                      AND ParameterCD = @ParameterCD
                  ) THEN 1 ELSE 0 END",
                new
                {
                    param.CommodityCode,
                    ParameterCD = parameterCd
                },
                transaction
            );

            if (!exists && !string.IsNullOrWhiteSpace(param.CommodityCode)
                && !string.IsNullOrWhiteSpace(parameterCd))
            {
                // Convert NABL Scope Status to single character
                string nablScope = null;
                if (!string.IsNullOrWhiteSpace(param.NablScopeStatus))
                {
                    var status = param.NablScopeStatus.ToUpper();
                    if (status == "Y" || status == "YES" || status == "1")
                        nablScope = "Y";
                    else if (status == "N" || status == "NO" || status == "0")
                        nablScope = "N";
                }

                await connection.ExecuteAsync(
                    @"INSERT INTO CATAGORY_PARAMETER (
                        Plant, CatagoryCD, ParameterCD, NABL_SCOPE,
                        ParameterGroupQty, Print_Sequence, ParameterRate, ParameterRegulatoryRate,
                        ParameterGroup, CommodityGroupCode, OutsourceParameter,
                        MethodCode, SpecificationCode, Sp_Code, CommodityLabDistCode,
                        FSSAICatagoryNo, SubClause, Specification,
                        Test_Unit, Test_Code, LOQ, PARAMSUBGROUP, PARAMSUBGROUPCD,
                        UploadDate, ADD_INFO
                      ) VALUES (
                        @Plant, @CommodityCode, @ParameterCD, @NablScope,
                        @SampleQuantityAnalysis, @ParameterSequence, @ParameterIndividualRate, @RegulatoryRateDrug,
                        @ParameterGroupCode, @CommodityGroupCode, @OutsourceYN,
                        @MethodCode, @SpecificationCode, @SpecificationCode, @LabCode,
                        @FssaiCategoryNo, @SubClause, @SpecificationName,
                        @TestUnit, @TestCode, @Loq, @ParameterSubGroup, @ParameterSubGroupCode,
                        GETDATE(), @AddInfo
                      )",
                    new
                    {
                        Plant = DEFAULT_PLANT_CODE,
                        param.CommodityCode,
                        ParameterCD = parameterCd,
                        NablScope = nablScope,
                        param.SampleQuantityAnalysis,
                        param.ParameterSequence,
                        param.ParameterIndividualRate,
                        param.RegulatoryRateDrug,
                        param.ParameterGroupCode,
                        param.CommodityGroupCode,
                        param.OutsourceYN,
                        param.MethodCode,
                        param.SpecificationCode,
                        param.FssaiCategoryNo,
                        param.SubClause,
                        param.SpecificationName,
                        param.TestUnit,
                        param.TestCode,
                        param.Loq,
                        param.ParameterSubGroup,
                        param.ParameterSubGroupCode,
                        param.AddInfo
                    },
                    transaction
                );
            }
        }
    }
}