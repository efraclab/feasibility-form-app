using Dapper;
using FeasibilityFormApp.Models;
using Microsoft.Data.SqlClient;

namespace FeasibilityFormApp.Repositories
{
    public class ParameterRepository : IParameterRepository
    {
        private readonly string _connectionString;
        private readonly string _mainConnectionString;

        public string DEFAULT_PLANT_CODE = "P001";

        public ParameterRepository(IConfiguration configuration)
        {
            _connectionString =
                configuration["Connnectionstrings:TestConnection"]
                ?? throw new InvalidOperationException(
                    "Connnectionstrings:TestConnection is not configured."
                );

            _mainConnectionString =
                configuration["Connnectionstrings:MyConnection"]
                ?? throw new InvalidOperationException(
                    "Connnectionstrings:MyConnection is not configured."
                );
        }


        // ============================================================
        // BULK INSERT INTO BUFFER
        // ============================================================

        public async Task<ParameterUploadResponse>
            BulkInsertParametersAsync(
                ParameterUploadRequest request
            )
        {
            using var connection =
                new SqlConnection(_connectionString);

            try
            {
                await connection.OpenAsync();

                using var transaction =
                    connection.BeginTransaction();


                var totalRows =
                    request.Parameters.Count;

                var successfulRows = 0;
                var failedRows = 0;

                var errors =
                    new List<string>();


                var batchId =
                    await connection.ExecuteScalarAsync<long>(
                        @"
                        SELECT
                            ISNULL(MAX(BatchId), 0) + 1
                        FROM ParameterMasterBuffer
                        ",
                        transaction: transaction
                    );


                var insertQuery = @"
INSERT INTO ParameterMasterBuffer
(
    BatchId,

    ParameterName,
    ParameterCode,

    ParameterGroup,
    ParameterGroupCode,

    ParameterSubGroup,
    ParameterSubGroupCode,

    CommodityName,
    CommodityCode,

    CommodityGroup,
    CommodityGroupCode,

    NonFssaiFssaiDrug,
    NonFssaiFssaiDrugCode,

    RegulationName,
    RegulationCode,

    ParameterLabDistribution,
    LabCode,

    TatDays,
    ParameterSequence,
    OutsourceYN,

    SampleQuantityAnalysis,
    SampleQuantityRetention,

    RequiredSampleQuantityUnit,
    UnitCode,

    NablScopeStatus,

    MethodName,
    MethodCode,

    SpecificationName,
    SpecificationCode,

    FssaiCategoryNo,
    SubClause,

    TestUnit,
    TestCode,

    Instrument,
    Loq,
    DetectorMode,
    Detector,

    ParameterIndividualRate,
    RegulatoryRateDrug,

    AddInfo,
    UploadedBy
)
SELECT
    @BatchId,

    COALESCE
    (
        NULLIF(@ParameterName, ''),
        (
            SELECT TOP 1
                headdesc
            FROM OHEADMST
            WHERE headcd = @ParameterCode
        )
    ),

    COALESCE
    (
        NULLIF(@ParameterCode, ''),
        (
            SELECT TOP 1
                headcd
            FROM OHEADMST
            WHERE headdesc = @ParameterName
        )
    ),

    COALESCE
    (
        NULLIF(@ParameterGroup, ''),
        (
            SELECT TOP 1
                CODEDESC
            FROM OCODEMST
            WHERE
                CODECD = @ParameterGroupCode
                AND CODETYPE = 'GM'
        )
    ),

    COALESCE
    (
        NULLIF(@ParameterGroupCode, ''),
        (
            SELECT TOP 1
                CODECD
            FROM OCODEMST
            WHERE
                CODEDESC = @ParameterGroup
                AND CODETYPE = 'GM'
        )
    ),

    COALESCE
    (
        NULLIF(@ParameterSubGroup, ''),
        (
            SELECT TOP 1
                CODEDESC
            FROM OCODEMST
            WHERE
                CODECD = @ParameterSubGroupCode
                AND CODETYPE = 'SG'
        )
    ),

    COALESCE
    (
        NULLIF(@ParameterSubGroupCode, ''),
        (
            SELECT TOP 1
                CODECD
            FROM OCODEMST
            WHERE
                CODEDESC = @ParameterSubGroup
                AND CODETYPE = 'SG'
        )
    ),

    COALESCE
    (
        NULLIF(@CommodityName, ''),
        (
            SELECT TOP 1
                CatagoryName
            FROM CatagoryMST
            WHERE
                CatagoryCode = @CommodityCode
        )
    ),

    COALESCE
    (
        NULLIF(@CommodityCode, ''),
        (
            SELECT TOP 1
                CatagoryCode
            FROM CatagoryMST
            WHERE
                CatagoryName = @CommodityName
        )
    ),

    COALESCE
    (
        NULLIF(@CommodityGroup, ''),
        (
            SELECT TOP 1
                CommodityGroupName
            FROM CommodityGroup
            WHERE
                CommodityGroupCode =
                    @CommodityGroupCode
        )
    ),

    COALESCE
    (
        NULLIF(@CommodityGroupCode, ''),
        (
            SELECT TOP 1
                CommodityGroupCode
            FROM CommodityGroup
            WHERE
                CommodityGroupName =
                    @CommodityGroup
        )
    ),

    @NonFssaiFssaiDrug,

    @NonFssaiFssaiDrugCode,

    COALESCE
    (
        NULLIF(@RegulationName, ''),
        (
            SELECT TOP 1
                RegulationName
            FROM Regulation
            WHERE
                RegulationCode =
                    @RegulationCode
        )
    ),

    COALESCE
    (
        NULLIF(@RegulationCode, ''),
        (
            SELECT TOP 1
                RegulationCode
            FROM Regulation
            WHERE
                RegulationName =
                    @RegulationName
        )
    ),

    COALESCE
    (
        NULLIF(@ParameterLabDistribution, ''),
        (
            SELECT TOP 1
                CODEDESC
            FROM OCODEMST
            WHERE
                CODECD = @LabCode
                AND CODETYPE = 'DM'
        )
    ),

    COALESCE
    (
        NULLIF(@LabCode, ''),
        (
            SELECT TOP 1
                CODECD
            FROM OCODEMST
            WHERE
                CODEDESC =
                    @ParameterLabDistribution
                AND CODETYPE = 'DM'
        )
    ),

    @TatDays,

    @ParameterSequence,

    @OutsourceYN,

    @SampleQuantityAnalysis,

    @SampleQuantityRetention,

    @RequiredSampleQuantityUnit,

    @UnitCode,

    @NablScopeStatus,

    COALESCE
    (
        NULLIF(@MethodName, ''),
        (
            SELECT TOP 1
                MethodName
            FROM ParameterMasterBuffer
            WHERE
                MethodCode = @MethodCode
                AND NULLIF(
                    LTRIM(RTRIM(MethodName)),
                    ''
                ) IS NOT NULL
            ORDER BY Id DESC
        )
    ),

    COALESCE
    (
        NULLIF(@MethodCode, ''),
        (
            SELECT TOP 1
                SpecMethodCd
            FROM SpecificationMst
            WHERE
                SpecName =
                    @SpecificationName
        )
    ),

    COALESCE
    (
        NULLIF(@SpecificationName, ''),
        (
            SELECT TOP 1
                SpecName
            FROM SpecificationMst
            WHERE
                SpecCode =
                    @SpecificationCode
        )
    ),

    COALESCE
    (
        NULLIF(@SpecificationCode, ''),
        (
            SELECT TOP 1
                SpecCode
            FROM SpecificationMst
            WHERE
                SpecName =
                    @SpecificationName
        )
    ),

    @FssaiCategoryNo,

    @SubClause,

    @TestUnit,

    @TestCode,

    @Instrument,

    @Loq,
    @DetectorMode,
    @Detector,

    @ParameterIndividualRate,

    @RegulatoryRateDrug,

    @AddInfo,

    @UploadedBy;
";


                foreach (
                    var param
                    in request.Parameters
                )
                {
                    try
                    {
                        await connection.ExecuteAsync(
                            insertQuery,
                            new
                            {
                                BatchId =
                                    batchId,

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
                                param.DetectorMode,
                                param.Detector,

                                param.ParameterIndividualRate,
                                param.RegulatoryRateDrug,

                                param.AddInfo,

                                request.UploadedBy
                            },
                            transaction:
                                transaction,
                            commandTimeout:
                                300
                        );


                        successfulRows++;
                    }
                    catch (Exception ex)
                    {
                        failedRows++;

                        errors.Add(
                            $"Row {successfulRows + failedRows}: {ex.Message}"
                        );
                    }
                }


                var logId =
                    await connection
                    .ExecuteScalarAsync<long>(
                        @"
                        INSERT INTO ParameterUploadBufferLog
                        (
                            BatchId,
                            FileName,
                            TotalRows,
                            SuccessfulRows,
                            FailedRows,
                            UploadedBy,
                            Status,
                            ErrorMessage,
                            CurrentStage,
                            WorkflowStatus,
                            LastActionBy,
                            LastActionAt,
                            WorkflowRemarks
                        )
                        OUTPUT INSERTED.Id
                        VALUES
                        (
                            @BatchId,
                            @FileName,
                            @TotalRows,
                            @SuccessfulRows,
                            @FailedRows,
                            @UploadedBy,
                            @Status,
                            @ErrorMessage,
                            @CurrentStage,
                            @WorkflowStatus,
                            @LastActionBy,
                            GETDATE(),
                            @WorkflowRemarks
                        )
                        ",
                        new
                        {
                            BatchId =
                                batchId,

                            request.FileName,

                            TotalRows =
                                totalRows,

                            SuccessfulRows =
                                successfulRows,

                            FailedRows =
                                failedRows,

                            request.UploadedBy,

                            Status =
                                failedRows == 0
                                    ? "Success"
                                    : successfulRows > 0
                                        ? "Partial"
                                        : "Failed",

                            ErrorMessage =
                                errors.Any()
                                    ? string.Join(
                                        "; ",
                                        errors.Take(10)
                                      )
                                    : null,

                            // Every new Excel upload starts in the
                            // Quotation workflow as a draft.
                            CurrentStage =
                                "Quotation",

                            WorkflowStatus =
                                "Draft",

                            LastActionBy =
                                request.UploadedBy,

                            WorkflowRemarks =
                                (string?)null
                        },
                        transaction
                    );


                transaction.Commit();


                return new ParameterUploadResponse
                {
                    UploadLogId =
                        logId,

                    TotalRows =
                        totalRows,

                    SuccessfulRows =
                        successfulRows,

                    FailedRows =
                        failedRows,

                    Status =
                        failedRows == 0
                            ? "Success"
                            : successfulRows > 0
                                ? "Partial"
                                : "Failed",

                    Message =
                        $"Batch {batchId} uploaded successfully",

                    Errors =
                        errors
                };
            }
            catch (Exception ex)
            {
                return new ParameterUploadResponse
                {
                    Status =
                        "Failed",

                    Message =
                        "Upload failed",

                    Errors =
                        new List<string>
                        {
                            ex.Message
                        }
                };
            }
        }


        // ============================================================
        // UPDATE BUFFER PARAMETER
        // ============================================================

        public async Task UpdateParameterAsync(
            ParameterMaster param,
            string? updatedBy,
            string? reviewedBy,
            string? remarks
        )
        {
            using var connection =
                new SqlConnection(_connectionString);


            var query = @"
UPDATE ParameterMasterBuffer
SET
    ParameterName =
        @ParameterName,

    ParameterCode =
        @ParameterCode,

    ParameterGroup =
        @ParameterGroup,

    ParameterGroupCode =
        @ParameterGroupCode,

    ParameterSubGroup =
        @ParameterSubGroup,

    ParameterSubGroupCode =
        @ParameterSubGroupCode,

    CommodityName =
        @CommodityName,

    CommodityCode =
        @CommodityCode,

    CommodityGroup =
        @CommodityGroup,

    CommodityGroupCode =
        @CommodityGroupCode,

    NonFssaiFssaiDrug =
        @NonFssaiFssaiDrug,

    NonFssaiFssaiDrugCode =
        @NonFssaiFssaiDrugCode,

    RegulationName =
        @RegulationName,

    RegulationCode =
        @RegulationCode,

    ParameterLabDistribution =
        @ParameterLabDistribution,

    LabCode =
        @LabCode,

    TatDays =
        @TatDays,

    ParameterSequence =
        @ParameterSequence,

    OutsourceYN =
        @OutsourceYN,

    SampleQuantityAnalysis =
        @SampleQuantityAnalysis,

    SampleQuantityRetention =
        @SampleQuantityRetention,

    RequiredSampleQuantityUnit =
        @RequiredSampleQuantityUnit,

    UnitCode =
        @UnitCode,

    NablScopeStatus =
        @NablScopeStatus,

    MethodName =
        @MethodName,

    MethodCode =
        @MethodCode,

    SpecificationName =
        @SpecificationName,

    SpecificationCode =
        @SpecificationCode,

    FssaiCategoryNo =
        @FssaiCategoryNo,

    SubClause =
        @SubClause,

    TestUnit =
        @TestUnit,

    TestCode =
        @TestCode,

    Instrument =
        @Instrument,

    Loq =
        @Loq,

    DetectorMode =
        @DetectorMode,

    Detector =
        @Detector,

    ParameterIndividualRate =
        @ParameterIndividualRate,

    RegulatoryRateDrug =
        @RegulatoryRateDrug,

    AddInfo =
        @AddInfo,

    Status =
        @Status,

    ReviewedAt =
        CASE
            WHEN ISNULL(ReviewedBy, '') <>
                 ISNULL(@ReviewedBy, '')
            THEN GETDATE()
            ELSE ReviewedAt
        END,

    ReviewedBy =
        CASE
            WHEN ISNULL(ReviewedBy, '') <>
                 ISNULL(@ReviewedBy, '')
            THEN @ReviewedBy
            ELSE ReviewedBy
        END,

    Remarks =
        @Remarks,

    LastUpdatedAt =
        CASE
            WHEN ISNULL(ReviewedBy, '') =
                 ISNULL(@ReviewedBy, '')
            THEN GETDATE()
            ELSE LastUpdatedAt
        END,

    LastUpdatedBy =
        CASE
            WHEN ISNULL(ReviewedBy, '') =
                 ISNULL(@ReviewedBy, '')
            THEN @UpdatedBy
            ELSE LastUpdatedBy
        END

WHERE Id = @Id;
";


            await connection.ExecuteAsync(
                query,
                new
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
                    param.DetectorMode,
                    param.Detector,

                    param.ParameterIndividualRate,
                    param.RegulatoryRateDrug,

                    param.AddInfo,
                    param.Status,

                    UpdatedBy =
                        updatedBy,

                    ReviewedBy =
                        reviewedBy,

                    Remarks =
                        remarks
                }
            );
        }


        // ============================================================
        // GET UPLOAD LOGS
        // ============================================================

        public async Task<IEnumerable<ParameterUploadLog>>
            GetUploadLogsAsync(
                int pageNumber = 1,
                int pageSize = 10
            )
        {
            using var connection =
                new SqlConnection(_connectionString);


            var offset =
                (pageNumber - 1) *
                pageSize;


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
    ErrorMessage,
    CurrentStage,
    WorkflowStatus,
    LastActionBy,
    LastActionAt,
    WorkflowRemarks
FROM ParameterUploadBufferLog
ORDER BY UploadedAt DESC
OFFSET @Offset ROWS
FETCH NEXT @PageSize ROWS ONLY;
";


            return await connection
                .QueryAsync<ParameterUploadLog>(
                    query,
                    new
                    {
                        Offset =
                            offset,

                        PageSize =
                            pageSize
                    }
                );
        }


        // ============================================================
        // GET / SEARCH BUFFER PARAMETERS
        // ============================================================

        public async Task<IEnumerable<ParameterMaster>>
            GetParametersAsync(
                string employeeId,
                string role,
                string searchTerm = null,
                int pageNumber = 1,
                int pageSize = 50
            )
        {
            using var connection =
                new SqlConnection(_connectionString);


            var offset =
                (pageNumber - 1) *
                pageSize;


            var query = @"
SELECT *
FROM ParameterMasterBuffer
WHERE
(
    @SearchTerm IS NULL
    OR @SearchTerm = ''
    OR ParameterName LIKE
        '%' + @SearchTerm + '%'
    OR ParameterCode LIKE
        '%' + @SearchTerm + '%'
    OR CommodityName LIKE
        '%' + @SearchTerm + '%'
)
AND
(
    @IsCrm = 1
    OR
    (
        @IsReviewer = 1
        AND EXISTS
        (
            SELECT 1
            FROM ParameterUploadBufferLog R
            WHERE R.BatchId = ParameterMasterBuffer.BatchId
              AND R.Id =
              (
                  SELECT MAX(R2.Id)
                  FROM ParameterUploadBufferLog R2
                  WHERE R2.BatchId = ParameterMasterBuffer.BatchId
              )
              AND
              (
                  (R.CurrentStage = 'Reviewer' AND R.WorkflowStatus = 'Pending')
                  OR
                  (R.CurrentStage = 'Admin' AND R.WorkflowStatus = 'Completed')
              )
        )
    )
    OR
    (
        @IsAdmin = 1
        AND EXISTS
        (
            SELECT 1
            FROM ParameterUploadBufferLog A
            WHERE A.BatchId = ParameterMasterBuffer.BatchId
              AND A.Id =
              (
                  SELECT MAX(A2.Id)
                  FROM ParameterUploadBufferLog A2
                  WHERE A2.BatchId = ParameterMasterBuffer.BatchId
              )
              AND A.CurrentStage = 'Admin'
              AND A.WorkflowStatus IN ('Pending', 'Completed')
        )
    )
    OR
    (
        @IsLab = 1
        AND EXISTS
        (
            SELECT 1
            FROM ParameterUploadBufferLog L
            WHERE L.BatchId = ParameterMasterBuffer.BatchId
              AND L.Id =
              (
                  SELECT MAX(L2.Id)
                  FROM ParameterUploadBufferLog L2
                  WHERE L2.BatchId = ParameterMasterBuffer.BatchId
              )
              AND L.CurrentStage = 'Lab'
        )
    )
    OR
    (
        @IsLab = 0
        AND @IsReviewer = 0
        AND @IsAdmin = 0
        AND UploadedBy = @EmployeeId
    )
)
ORDER BY Id ASC
OFFSET @Offset ROWS
FETCH NEXT @PageSize ROWS ONLY;
";


            return await connection
                .QueryAsync<ParameterMaster>(
                    query,
                    new
                    {
                        SearchTerm =
                            searchTerm,

                        EmployeeId =
                            employeeId,

                        IsCrm =
                            role != null &&
                            role.Contains(
                                "crm",
                                StringComparison
                                    .OrdinalIgnoreCase
                            ),

                        IsLab =
                            string.Equals(
                                role?.Trim(),
                                "ROLE000006",
                                StringComparison.OrdinalIgnoreCase
                            )
                            ||
                            string.Equals(
                                role?.Trim(),
                                "ROLE000007",
                                StringComparison.OrdinalIgnoreCase
                            ),

                        IsReviewer =
                            string.Equals(
                                role?.Trim(),
                                "REVIEWER",
                                StringComparison.OrdinalIgnoreCase
                            ),

                        IsAdmin =
                            string.Equals(
                                role?.Trim(),
                                "ADMIN",
                                StringComparison.OrdinalIgnoreCase
                            ),

                        Offset =
                            offset,

                        PageSize =
                            pageSize
                    }
                );
        }


        // ============================================================
        // DROPDOWN OPTIONS
        // ============================================================

        public async Task<ParameterDropdownOptions>
            GetDropdownOptionsAsync()
        {
            using var connection =
                new SqlConnection(_connectionString);

            using var mainConnection =
                new SqlConnection(_mainConnectionString);

            await connection.OpenAsync();
            await mainConnection.OpenAsync();


            // --------------------------------------------------------
            // PARAMETER CODE -> PARAMETER NAME
            // --------------------------------------------------------

            var parameterCodes =
                await connection.QueryAsync
                <ParameterDropdownOption>(
                    @"
SELECT DISTINCT
    LTRIM(RTRIM(headcd)) AS Code,
    LTRIM(RTRIM(headdesc)) AS Name
FROM OHEADMST
WHERE
    NULLIF(
        LTRIM(RTRIM(headcd)),
        ''
    ) IS NOT NULL
    AND LTRIM(RTRIM(headcd)) <> '-'
ORDER BY Code;
"
                );


            // --------------------------------------------------------
            // PARAMETER GROUP -> PARAMETER GROUP CODE
            // Main LIMS: OCODEMST, CODETYPE = 'GM'
            // --------------------------------------------------------

            var parameterGroupCodes =
                await mainConnection.QueryAsync
                <ParameterDropdownOption>(
                    @"
SELECT DISTINCT
    LTRIM(RTRIM(CODECD)) AS Code,
    LTRIM(RTRIM(CODEDESC)) AS Name
FROM [Efrac_Lims_2025].[dbo].[OCODEMST]
WHERE
    CODETYPE = 'GM'
    AND NULLIF(LTRIM(RTRIM(CODECD)), '') IS NOT NULL
    AND LTRIM(RTRIM(CODECD)) <> '-'
    AND NULLIF(LTRIM(RTRIM(CODEDESC)), '') IS NOT NULL
ORDER BY Name, Code;
"
                );


            // --------------------------------------------------------
            // PARAMETER SUB-GROUP -> PARAMETER SUB-GROUP CODE
            // Main LIMS: OCODEMST, CODETYPE = 'SG'
            // --------------------------------------------------------

            var parameterSubGroupCodes =
                await mainConnection.QueryAsync
                <ParameterDropdownOption>(
                    @"
SELECT DISTINCT
    LTRIM(RTRIM(CODECD)) AS Code,
    LTRIM(RTRIM(CODEDESC)) AS Name
FROM [Efrac_Lims_2025].[dbo].[OCODEMST]
WHERE
    CODETYPE = 'SG'
    AND NULLIF(LTRIM(RTRIM(CODECD)), '') IS NOT NULL
    AND LTRIM(RTRIM(CODECD)) <> '-'
    AND NULLIF(LTRIM(RTRIM(CODEDESC)), '') IS NOT NULL
ORDER BY Name, Code;
"
                );


            // --------------------------------------------------------
            // COMMODITY CODE -> COMMODITY NAME
            // --------------------------------------------------------

            var commodityCodes =
                await mainConnection.QueryAsync
                <ParameterDropdownOption>(
                    @"
SELECT DISTINCT
    LTRIM(RTRIM(CatagoryCode)) AS Code,
    LTRIM(RTRIM(CatagoryName)) AS Name
FROM [Efrac_Lims_2025].[dbo].[CatagoryMST]
WHERE
    NULLIF(LTRIM(RTRIM(CatagoryCode)), '') IS NOT NULL
    AND LTRIM(RTRIM(CatagoryCode)) <> '-'
    AND NULLIF(LTRIM(RTRIM(CatagoryName)), '') IS NOT NULL
ORDER BY Name, Code;
"
                );


            // --------------------------------------------------------
            // COMMODITY GROUP CODE -> COMMODITY GROUP
            // --------------------------------------------------------

            var commodityGroupCodes =
                await connection.QueryAsync
                <ParameterDropdownOption>(
                    @"
SELECT DISTINCT
    LTRIM(
        RTRIM(CommodityGroupCode)
    ) AS Code,

    LTRIM(
        RTRIM(CommodityGroupName)
    ) AS Name

FROM CommodityGroup

WHERE
    NULLIF(
        LTRIM(
            RTRIM(CommodityGroupCode)
        ),
        ''
    ) IS NOT NULL

    AND LTRIM(
        RTRIM(CommodityGroupCode)
    ) <> '-'

ORDER BY Code;
"
                );


            // --------------------------------------------------------
            // NON FSSAI/FSSAI/DRUG CODE -> DESCRIPTION
            // --------------------------------------------------------

            var nonFssaiFssaiDrugCodes =
                await connection.QueryAsync
                <ParameterDropdownOption>(
                    @"
SELECT DISTINCT
    LTRIM(
        RTRIM(NonFssaiFssaiDrugCode)
    ) AS Code,

    LTRIM(
        RTRIM(NonFssaiFssaiDrug)
    ) AS Name

FROM ParameterMasterBuffer

WHERE
    NULLIF(
        LTRIM(
            RTRIM(NonFssaiFssaiDrugCode)
        ),
        ''
    ) IS NOT NULL

    AND LTRIM(
        RTRIM(NonFssaiFssaiDrugCode)
    ) <> '-'

    AND NULLIF(
        LTRIM(
            RTRIM(NonFssaiFssaiDrug)
        ),
        ''
    ) IS NOT NULL

ORDER BY Code;
"
                );


            // --------------------------------------------------------
            // REGULATION CODE -> REGULATION NAME
            // --------------------------------------------------------

            var regulationCodes =
                await mainConnection.QueryAsync
                <ParameterDropdownOption>(
                    @"
SELECT
    LTRIM(RTRIM(RegulationCode)) AS Code,
    MAX(LTRIM(RTRIM(RegulationName))) AS Name
FROM [Efrac_Lims_2025].[dbo].[Regulation]
WHERE
    NULLIF(LTRIM(RTRIM(RegulationCode)), '') IS NOT NULL
    AND LTRIM(RTRIM(RegulationCode)) <> '-'
    AND NULLIF(LTRIM(RTRIM(RegulationName)), '') IS NOT NULL
GROUP BY
    LTRIM(RTRIM(RegulationCode))
ORDER BY Name, Code;
"
                );


            // --------------------------------------------------------
            // LAB CODE -> LAB DESCRIPTION
            // --------------------------------------------------------

            var labCodes =
                await mainConnection.QueryAsync
                <ParameterDropdownOption>(
                    @"
SELECT DISTINCT
    LTRIM(RTRIM(CODECD)) AS Code,
    LTRIM(RTRIM(CODEDESC)) AS Name
FROM [Efrac_Lims_2025].[dbo].[OCODEMST]
WHERE
    CODETYPE = 'DM'
    AND NULLIF(LTRIM(RTRIM(CODECD)), '') IS NOT NULL
    AND LTRIM(RTRIM(CODECD)) <> '-'
    AND NULLIF(LTRIM(RTRIM(CODEDESC)), '') IS NOT NULL
ORDER BY Name, Code;
"
                );


            // --------------------------------------------------------
            // UNIT CODE -> REQUIRED SAMPLE UNIT
            // --------------------------------------------------------

            var unitCodes =
                await connection.QueryAsync
                <ParameterDropdownOption>(
                    @"
SELECT
    LTRIM(RTRIM(UnitCode)) AS Code,

    MAX(
        LTRIM(
            RTRIM(RequiredSampleQuantityUnit)
        )
    ) AS Name

FROM ParameterMasterBuffer

WHERE
    NULLIF(
        LTRIM(RTRIM(UnitCode)),
        ''
    ) IS NOT NULL

    AND LTRIM(RTRIM(UnitCode)) <> '-'

    AND NULLIF(
        LTRIM(
            RTRIM(RequiredSampleQuantityUnit)
        ),
        ''
    ) IS NOT NULL

GROUP BY
    LTRIM(RTRIM(UnitCode))

ORDER BY Code;
"
                );


            // --------------------------------------------------------
            // METHOD NAME -> METHOD CODE
            // Main LIMS: OCODEMST, CODETYPE = 'ME'
            // --------------------------------------------------------

            var methodCodes =
                await mainConnection.QueryAsync
                <ParameterDropdownOption>(
                    @"
SELECT DISTINCT
    LTRIM(RTRIM(CODECD)) AS Code,
    LTRIM(RTRIM(CODEDESC)) AS Name
FROM [Efrac_Lims_2025].[dbo].[OCODEMST]
WHERE
    CODETYPE = 'ME'
    AND NULLIF(LTRIM(RTRIM(CODECD)), '') IS NOT NULL
    AND LTRIM(RTRIM(CODECD)) <> '-'
    AND NULLIF(LTRIM(RTRIM(CODEDESC)), '') IS NOT NULL
ORDER BY Name, Code;
"
                );


            // --------------------------------------------------------
            // SPECIFICATION NAME -> SPECIFICATION CODE
            // Main LIMS: SpecificationMst
            // --------------------------------------------------------

            var specificationCodes =
                await mainConnection.QueryAsync
                <ParameterDropdownOption>(
                    @"
SELECT
    LTRIM(RTRIM(SpecCode)) AS Code,
    MAX(LTRIM(RTRIM(SpecName))) AS Name
FROM [Efrac_Lims_2025].[dbo].[SpecificationMst]
WHERE
    NULLIF(LTRIM(RTRIM(SpecCode)), '') IS NOT NULL
    AND LTRIM(RTRIM(SpecCode)) <> '-'
    AND NULLIF(LTRIM(RTRIM(SpecName)), '') IS NOT NULL
GROUP BY
    LTRIM(RTRIM(SpecCode))
ORDER BY Name, Code;
"
                );


            // --------------------------------------------------------
            // TEST UNIT -> TEST CODE
            // Main LIMS: OCODEMST, CODETYPE = 'U2'
            // --------------------------------------------------------

            var testCodes =
                await mainConnection.QueryAsync
                <ParameterDropdownOption>(
                    @"
SELECT DISTINCT
    LTRIM(RTRIM(CODECD)) AS Code,
    LTRIM(RTRIM(CODEDESC)) AS Name
FROM [Efrac_Lims_2025].[dbo].[OCODEMST]
WHERE
    CODETYPE = 'U2'
    AND NULLIF(LTRIM(RTRIM(CODECD)), '') IS NOT NULL
    AND LTRIM(RTRIM(CODECD)) <> '-'
    AND NULLIF(LTRIM(RTRIM(CODEDESC)), '') IS NOT NULL
ORDER BY Name, Code;
"
                );



            // --------------------------------------------------------
            // LOQ SEARCH SUGGESTIONS
            // Main LIMS: SpecificationMst.SpecLOQ
            //
            // NBSP (CHAR 160) is normalized to a normal space so values
            // such as "0.005 " do not appear as visual duplicates.
            // LOQ is text data: numeric, ranges and qualitative values
            // are all intentionally preserved.
            // --------------------------------------------------------

            var loqOptions =
                await mainConnection.QueryAsync
                <ParameterDropdownOption>(
                    @"
SELECT DISTINCT
    LTRIM(RTRIM(REPLACE(SpecLOQ, NCHAR(160), N' '))) AS Code,
    LTRIM(RTRIM(REPLACE(SpecLOQ, NCHAR(160), N' '))) AS Name
FROM [Efrac_Lims_2025].[dbo].[SpecificationMst]
WHERE
    NULLIF(
        LTRIM(RTRIM(REPLACE(SpecLOQ, NCHAR(160), N' '))),
        ''
    ) IS NOT NULL
ORDER BY Name;
"
                );


            // --------------------------------------------------------
            // DETECTOR MODE SEARCH SUGGESTIONS
            // Main LIMS: OHEADMST.headDetectorMode
            // --------------------------------------------------------

            var detectorModeOptions =
                await mainConnection.QueryAsync
                <ParameterDropdownOption>(
                    @"
SELECT DISTINCT
    LTRIM(RTRIM(REPLACE(headDetectorMode, NCHAR(160), N' '))) AS Code,
    LTRIM(RTRIM(REPLACE(headDetectorMode, NCHAR(160), N' '))) AS Name
FROM OHEADMST
WHERE
    NULLIF(
        LTRIM(RTRIM(REPLACE(headDetectorMode, NCHAR(160), N' '))),
        ''
    ) IS NOT NULL
ORDER BY Name;
"
                );


            // --------------------------------------------------------
            // DETECTOR SEARCH SUGGESTIONS
            // Main LIMS: OHEADMST.headDetector
            // --------------------------------------------------------

            var detectorOptions =
                await mainConnection.QueryAsync
                <ParameterDropdownOption>(
                    @"
SELECT DISTINCT
    LTRIM(RTRIM(REPLACE(headDetector, NCHAR(160), N' '))) AS Code,
    LTRIM(RTRIM(REPLACE(headDetector, NCHAR(160), N' '))) AS Name
FROM OHEADMST
WHERE
    NULLIF(
        LTRIM(RTRIM(REPLACE(headDetector, NCHAR(160), N' '))),
        ''
    ) IS NOT NULL
ORDER BY Name;
"
                );


            return new ParameterDropdownOptions
            {
                ParameterCodes =
                    parameterCodes,

                ParameterGroupCodes =
                    parameterGroupCodes,

                ParameterSubGroupCodes =
                    parameterSubGroupCodes,

                CommodityCodes =
                    commodityCodes,

                CommodityGroupCodes =
                    commodityGroupCodes,

                NonFssaiFssaiDrugCodes =
                    nonFssaiFssaiDrugCodes,

                RegulationCodes =
                    regulationCodes,

                LabCodes =
                    labCodes,

                UnitCodes =
                    unitCodes,

                MethodCodes =
                    methodCodes,

                SpecificationCodes =
                    specificationCodes,

                TestCodes =
                    testCodes,

                LoqOptions =
                    loqOptions,

                DetectorModeOptions =
                    detectorModeOptions,

                DetectorOptions =
                    detectorOptions
            };
        }


        // ============================================================
        // UPLOAD APPROVED BUFFER DATA TO MASTER TABLES
        // ============================================================

        public async Task<ParameterUploadResponse>
            UploadToMasterTablesAsync(
                long batchId,
                string uploadedBy
            )
        {
            if (!string.Equals(
                    uploadedBy?.Trim(),
                    "admin",
                    StringComparison.OrdinalIgnoreCase))
            {
                throw new UnauthorizedAccessException(
                    "Only the Admin account can upload parameters to master tables."
                );
            }

            using var connection =
                new SqlConnection(_connectionString);

            await connection.OpenAsync();

            using var transaction =
                connection.BeginTransaction();

            try
            {
                // Lock and verify current workflow stage.
                var workflowLog =
                    await connection.QuerySingleOrDefaultAsync<ParameterUploadLog>(
                        @"
SELECT TOP 1
    Id,
    BatchId,
    FileName,
    TotalRows,
    SuccessfulRows,
    FailedRows,
    UploadedBy,
    UploadedAt,
    Status,
    ErrorMessage,
    CurrentStage,
    WorkflowStatus,
    LastActionBy,
    LastActionAt,
    WorkflowRemarks
FROM ParameterUploadBufferLog WITH (UPDLOCK, HOLDLOCK)
WHERE BatchId = @BatchId
ORDER BY Id DESC;",
                        new
                        {
                            BatchId = batchId
                        },
                        transaction
                    );

                if (workflowLog == null)
                {
                    throw new Exception(
                        $"Batch {batchId} was not found."
                    );
                }

                if (!string.Equals(
                        workflowLog.CurrentStage,
                        "Admin",
                        StringComparison.OrdinalIgnoreCase)
                    ||
                    !string.Equals(
                        workflowLog.WorkflowStatus,
                        "Pending",
                        StringComparison.OrdinalIgnoreCase))
                {
                    throw new Exception(
                        $"Batch {batchId} can be uploaded only from Admin / Pending. Current workflow is {workflowLog.CurrentStage ?? "Unknown"} / {workflowLog.WorkflowStatus ?? "Unknown"}."
                    );
                }

                var totalRows =
                    await connection.ExecuteScalarAsync<int>(
                        @"
SELECT COUNT(1)
FROM ParameterMasterBuffer
WHERE BatchId = @BatchId;",
                        new
                        {
                            BatchId = batchId
                        },
                        transaction
                    );

                if (totalRows == 0)
                {
                    throw new Exception(
                        "No parameters found for this batch."
                    );
                }

                var nonApprovedRows =
                    await connection.ExecuteScalarAsync<int>(
                        @"
SELECT COUNT(1)
FROM ParameterMasterBuffer
WHERE BatchId = @BatchId
  AND ISNULL(Status, 'Pending') <> 'Approved';",
                        new
                        {
                            BatchId = batchId
                        },
                        transaction
                    );

                if (nonApprovedRows > 0)
                {
                    throw new Exception(
                        $"All parameters must be approved before final upload. {nonApprovedRows} parameter(s) are not approved."
                    );
                }

                var bufferParameters =
                    (
                        await connection
                        .QueryAsync<ParameterMaster>(
                            @"
SELECT *
FROM ParameterMasterBuffer
WHERE
    BatchId = @BatchId
    AND Status = 'Approved'
ORDER BY Id;",
                            new
                            {
                                BatchId = batchId
                            },
                            transaction
                        )
                    ).ToList();

                foreach (
                    var param
                    in bufferParameters
                )
                {
                    await InsertCommodityGroupAsync(
                        connection,
                        transaction,
                        param,
                        uploadedBy,
                        batchId
                    );

                    await InsertCategoryMasterAsync(
                        connection,
                        transaction,
                        param,
                        uploadedBy,
                        batchId
                    );

                    await InsertOHeadBasicAsync(
                        connection,
                        transaction,
                        param,
                        uploadedBy,
                        batchId
                    );

                    await InsertSpecificationMasterAsync(
                        connection,
                        transaction,
                        param,
                        uploadedBy,
                        batchId
                    );

                    await InsertParameterHeadMasterAsync(
                        connection,
                        transaction,
                        param,
                        uploadedBy,
                        batchId
                    );

                    await InsertRegulationAsync(
                        connection,
                        transaction,
                        param,
                        uploadedBy,
                        batchId
                    );

                    await InsertCategoryParameterAsync(
                        connection,
                        transaction,
                        param,
                        uploadedBy,
                        batchId
                    );

                    await connection.ExecuteAsync(
                        @"
UPDATE ParameterMasterBuffer
SET
    Status = 'Uploaded',
    LastUpdatedAt = GETDATE(),
    LastUpdatedBy = @UploadedBy
WHERE Id = @Id;",
                        new
                        {
                            param.Id,
                            UploadedBy = uploadedBy
                        },
                        transaction
                    );
                }

                // Technical upload state + business workflow completion.
                await connection.ExecuteAsync(
                    @"
UPDATE ParameterUploadBufferLog
SET
    Status = 'Uploaded',
    ErrorMessage = NULL,
    CurrentStage = 'Admin',
    WorkflowStatus = 'Completed',
    LastActionBy = @UploadedBy,
    LastActionAt = GETDATE(),
    WorkflowRemarks = 'Admin uploaded approved parameters to master tables'
WHERE BatchId = @BatchId
  AND CurrentStage = 'Admin'
  AND WorkflowStatus = 'Pending';",
                    new
                    {
                        BatchId = batchId,
                        UploadedBy = uploadedBy
                    },
                    transaction
                );

                await connection.ExecuteAsync(
                    @"
INSERT INTO USERLOG2
(
    USERID,
    USERWRPS,
    USERDATE,
    USERSYSTEM,
    [Change],
    ADD_INFO
)
VALUES
(
    @UserId,
    @UserWrps,
    GETDATE(),
    @UserSystem,
    @Change,
    @AddInfo
);",
                    new
                    {
                        UserId = uploadedBy,
                        UserWrps = $"PARAM-BATCH-{batchId}",
                        UserSystem = "FeasibilityFormApp",
                        Change = "Master Upload",
                        AddInfo =
                            $"Batch {batchId}: Admin / Pending to Admin / Completed. {bufferParameters.Count} approved parameter(s) uploaded to master tables."
                    },
                    transaction
                );

                transaction.Commit();

                return new ParameterUploadResponse
                {
                    UploadLogId = workflowLog.Id,
                    TotalRows = bufferParameters.Count,
                    SuccessfulRows = bufferParameters.Count,
                    FailedRows = 0,
                    Status = "Success",
                    Message =
                        $"All {bufferParameters.Count} parameters uploaded successfully. Workflow completed.",
                    Errors = new List<string>()
                };
            }
            catch (Exception ex)
            {
                transaction.Rollback();

                // Keep workflow at Admin/Pending after a failed final upload,
                // but record the technical failure message.
                await connection.ExecuteAsync(
                    @"
UPDATE ParameterUploadBufferLog
SET
    ErrorMessage = @ErrorMessage
WHERE BatchId = @BatchId
  AND CurrentStage = 'Admin'
  AND WorkflowStatus = 'Pending';",
                    new
                    {
                        BatchId = batchId,
                        ErrorMessage = ex.Message
                    }
                );

                throw new Exception(
                    $"Upload to master tables failed. {ex.Message}",
                    ex
                );
            }
        }


        // ============================================================
        // REVERT FINAL MASTER UPLOAD
        // Deletes only rows that were recorded as newly created by this batch.
        // Shared Commodity/CommodityGroup rows are preserved if other master
        // records still reference them.
        // ============================================================
        public async Task<ParameterUploadResponse> RevertMasterUploadAsync(
            long batchId,
            string revertedBy
        )
        {
            if (!string.Equals(
                    revertedBy?.Trim(),
                    "admin",
                    StringComparison.OrdinalIgnoreCase))
            {
                throw new UnauthorizedAccessException(
                    "Only Admin can revert the final master upload."
                );
            }

            using var connection =
                new SqlConnection(_connectionString);

            await connection.OpenAsync();

            using var transaction =
                connection.BeginTransaction();

            try
            {
                var workflowLog =
                    await connection.QuerySingleOrDefaultAsync<ParameterUploadLog>(
                        @"
SELECT TOP 1
    Id,
    BatchId,
    FileName,
    TotalRows,
    SuccessfulRows,
    FailedRows,
    UploadedBy,
    UploadedAt,
    Status,
    ErrorMessage,
    CurrentStage,
    WorkflowStatus,
    LastActionBy,
    LastActionAt,
    WorkflowRemarks
FROM ParameterUploadBufferLog WITH (UPDLOCK, HOLDLOCK)
WHERE BatchId = @BatchId
ORDER BY Id DESC;",
                        new { BatchId = batchId },
                        transaction
                    );

                if (workflowLog == null)
                    throw new Exception($"Batch {batchId} was not found.");

                if (!string.Equals(
                        workflowLog.CurrentStage,
                        "Admin",
                        StringComparison.OrdinalIgnoreCase)
                    ||
                    !string.Equals(
                        workflowLog.WorkflowStatus,
                        "Completed",
                        StringComparison.OrdinalIgnoreCase))
                {
                    throw new Exception(
                        $"Batch {batchId} can be reverted only from Admin / Completed. Current workflow is {workflowLog.CurrentStage ?? "Unknown"} / {workflowLog.WorkflowStatus ?? "Unknown"}."
                    );
                }

                var auditRows =
                    (await connection.QueryAsync<dynamic>(
                        @"
SELECT
    Id,
    TableName,
    Key1Name,
    Key1Value,
    Key2Name,
    Key2Value,
    Key3Name,
    Key3Value
FROM ParameterMasterUploadAudit WITH (UPDLOCK, HOLDLOCK)
WHERE BatchId = @BatchId
  AND IsReverted = 0
ORDER BY
    CASE TableName
        WHEN 'CATAGORY_PARAMETER' THEN 1
        WHEN 'Regulation' THEN 2
        WHEN 'SpecificationMst' THEN 3
        WHEN 'OHEADMST' THEN 4
        WHEN 'OHEADBasic' THEN 5
        WHEN 'CatagoryMST' THEN 6
        WHEN 'CommodityGroup' THEN 7
        ELSE 99
    END,
    Id DESC;",
                        new { BatchId = batchId },
                        transaction
                    )).ToList();

                if (!auditRows.Any())
                {
                    throw new Exception(
                        $"Batch {batchId} has no active master-upload audit records. Older batches uploaded before audit tracking cannot be safely reverted automatically."
                    );
                }

                var deletedRows = 0;
                var preservedSharedRows = 0;

                foreach (var audit in auditRows)
                {
                    string tableName = audit.TableName;
                    string? k1 = audit.Key1Value;
                    string? k2 = audit.Key2Value;
                    string? k3 = audit.Key3Value;

                    int affected = 0;

                    switch (tableName)
                    {
                        case "CATAGORY_PARAMETER":
                            affected = await connection.ExecuteAsync(
                                @"
DELETE FROM CATAGORY_PARAMETER
WHERE LTRIM(RTRIM(CatagoryCD)) = @K1
  AND LTRIM(RTRIM(ParameterCD)) = @K2;",
                                new { K1 = k1, K2 = k2 },
                                transaction
                            );
                            break;

                        case "Regulation":
                            affected = await connection.ExecuteAsync(
                                @"
DELETE FROM Regulation
WHERE LTRIM(RTRIM(RegulationCode)) = @K1
  AND LTRIM(RTRIM(ISNULL(CommodityCode, ''))) = ISNULL(@K2, '')
  AND LTRIM(RTRIM(ISNULL(RegParameter, ''))) = ISNULL(@K3, '');",
                                new { K1 = k1, K2 = k2, K3 = k3 },
                                transaction
                            );
                            break;

                        case "SpecificationMst":
                            affected = await connection.ExecuteAsync(
                                @"
DELETE FROM SpecificationMst
WHERE LTRIM(RTRIM(SpecCode)) = @K1
  AND LTRIM(RTRIM(ISNULL(SpecHeadCd, ''))) = ISNULL(@K2, '')
  AND LTRIM(RTRIM(ISNULL(SpecCommodityCd, ''))) = ISNULL(@K3, '');",
                                new { K1 = k1, K2 = k2, K3 = k3 },
                                transaction
                            );
                            break;

                        case "OHEADMST":
                            affected = await connection.ExecuteAsync(
                                @"
DELETE FROM OHEADMST
WHERE LTRIM(RTRIM(headPlantCd)) = @K1
  AND LTRIM(RTRIM(headcd)) = @K2;",
                                new { K1 = k1, K2 = k2 },
                                transaction
                            );
                            break;

                        case "OHEADBasic":
                            affected = await connection.ExecuteAsync(
                                @"
DELETE FROM OHEADBasic
WHERE LTRIM(RTRIM(headcd)) = @K1;",
                                new { K1 = k1 },
                                transaction
                            );
                            break;

                        case "CatagoryMST":
                            var commodityInUse =
                                await connection.ExecuteScalarAsync<int>(
                                    @"
SELECT
    CASE WHEN
        EXISTS (
            SELECT 1
            FROM CATAGORY_PARAMETER
            WHERE LTRIM(RTRIM(CatagoryCD)) = @Code
        )
        OR EXISTS (
            SELECT 1
            FROM Regulation
            WHERE LTRIM(RTRIM(ISNULL(CommodityCode, ''))) = @Code
        )
        OR EXISTS (
            SELECT 1
            FROM SpecificationMst
            WHERE LTRIM(RTRIM(ISNULL(SpecCommodityCd, ''))) = @Code
        )
    THEN 1 ELSE 0 END;",
                                    new { Code = k1 },
                                    transaction
                                );

                            if (commodityInUse == 0)
                            {
                                affected = await connection.ExecuteAsync(
                                    @"
DELETE FROM CatagoryMST
WHERE LTRIM(RTRIM(CatagoryCode)) = @Code;",
                                    new { Code = k1 },
                                    transaction
                                );
                            }
                            else
                            {
                                preservedSharedRows++;
                            }
                            break;

                        case "CommodityGroup":
                            var groupInUse =
                                await connection.ExecuteScalarAsync<int>(
                                    @"
SELECT
    CASE WHEN
        EXISTS (
            SELECT 1
            FROM CatagoryMST
            WHERE LTRIM(RTRIM(ISNULL(CatagoryGroupCode, ''))) = @Code
        )
        OR EXISTS (
            SELECT 1
            FROM CATAGORY_PARAMETER
            WHERE LTRIM(RTRIM(ISNULL(CommodityGroupCode, ''))) = @Code
        )
        OR EXISTS (
            SELECT 1
            FROM Regulation
            WHERE LTRIM(RTRIM(ISNULL(CommodityGroupCode, ''))) = @Code
        )
        OR EXISTS (
            SELECT 1
            FROM SpecificationMst
            WHERE LTRIM(RTRIM(ISNULL(SpecCommodityGroupCode, ''))) = @Code
        )
    THEN 1 ELSE 0 END;",
                                    new { Code = k1 },
                                    transaction
                                );

                            if (groupInUse == 0)
                            {
                                affected = await connection.ExecuteAsync(
                                    @"
DELETE FROM CommodityGroup
WHERE LTRIM(RTRIM(CommodityGroupCode)) = @Code;",
                                    new { Code = k1 },
                                    transaction
                                );
                            }
                            else
                            {
                                preservedSharedRows++;
                            }
                            break;

                        default:
                            throw new Exception(
                                $"Unsupported audited master table '{tableName}'. Revert stopped for safety."
                            );
                    }

                    deletedRows += affected;

                    await connection.ExecuteAsync(
                        @"
UPDATE ParameterMasterUploadAudit
SET
    IsReverted = 1,
    RevertedBy = @RevertedBy,
    RevertedAt = GETDATE()
WHERE Id = @Id;",
                        new
                        {
                            Id = (long)audit.Id,
                            RevertedBy = revertedBy
                        },
                        transaction
                    );
                }

                var parameterCount =
                    await connection.ExecuteScalarAsync<int>(
                        @"
SELECT COUNT(1)
FROM ParameterMasterBuffer
WHERE BatchId = @BatchId;",
                        new { BatchId = batchId },
                        transaction
                    );

                await connection.ExecuteAsync(
                    @"
UPDATE ParameterMasterBuffer
SET
    Status = 'Approved',
    LastUpdatedAt = GETDATE(),
    LastUpdatedBy = @RevertedBy
WHERE BatchId = @BatchId;",
                    new
                    {
                        BatchId = batchId,
                        RevertedBy = revertedBy
                    },
                    transaction
                );

                await connection.ExecuteAsync(
                    @"
UPDATE ParameterUploadBufferLog
SET
    Status = 'Approved',
    ErrorMessage = NULL,
    CurrentStage = 'Admin',
    WorkflowStatus = 'Pending',
    LastActionBy = @RevertedBy,
    LastActionAt = GETDATE(),
    WorkflowRemarks = 'Final master upload reverted by Admin'
WHERE BatchId = @BatchId
  AND CurrentStage = 'Admin'
  AND WorkflowStatus = 'Completed';",
                    new
                    {
                        BatchId = batchId,
                        RevertedBy = revertedBy
                    },
                    transaction
                );

                await connection.ExecuteAsync(
                    @"
INSERT INTO USERLOG2
(
    USERID,
    USERWRPS,
    USERDATE,
    USERSYSTEM,
    [Change],
    ADD_INFO
)
VALUES
(
    @UserId,
    @UserWrps,
    GETDATE(),
    @UserSystem,
    @Change,
    @AddInfo
);",
                    new
                    {
                        UserId = revertedBy,
                        UserWrps = $"PARAM-BATCH-{batchId}",
                        UserSystem = "FeasibilityFormApp",
                        Change = "Master Revert",
                        AddInfo =
                            $"Batch {batchId}: Admin / Completed to Admin / Pending. {deletedRows} master row(s) deleted; {preservedSharedRows} shared master row(s) preserved."
                    },
                    transaction
                );

                transaction.Commit();

                return new ParameterUploadResponse
                {
                    UploadLogId = workflowLog.Id,
                    TotalRows = parameterCount,
                    SuccessfulRows = parameterCount,
                    FailedRows = 0,
                    Status = "Success",
                    Message =
                        preservedSharedRows > 0
                            ? $"Batch {batchId} reverted successfully. {deletedRows} master row(s) removed. {preservedSharedRows} shared Commodity/Commodity Group row(s) were preserved because they are still in use."
                            : $"Batch {batchId} reverted successfully. {deletedRows} master row(s) removed. The batch is back at Admin / Pending.",
                    Errors = new List<string>()
                };
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }


        // ============================================================
        // MASTER UPLOAD AUDIT
        // Records ONLY rows newly inserted by this batch.
        // Existing master rows that were skipped are never recorded.
        // ============================================================
        private async Task RecordMasterUploadAuditAsync(
            SqlConnection connection,
            SqlTransaction transaction,
            long batchId,
            long? bufferParameterId,
            string tableName,
            string? key1Name,
            string? key1Value,
            string? key2Name,
            string? key2Value,
            string? key3Name,
            string? key3Value,
            string uploadedBy
        )
        {
            await connection.ExecuteAsync(
                @"
INSERT INTO ParameterMasterUploadAudit
(
    BatchId,
    BufferParameterId,
    TableName,
    Key1Name,
    Key1Value,
    Key2Name,
    Key2Value,
    Key3Name,
    Key3Value,
    UploadedBy,
    UploadedAt,
    IsReverted
)
VALUES
(
    @BatchId,
    @BufferParameterId,
    @TableName,
    @Key1Name,
    @Key1Value,
    @Key2Name,
    @Key2Value,
    @Key3Name,
    @Key3Value,
    @UploadedBy,
    GETDATE(),
    0
);",
                new
                {
                    BatchId = batchId,
                    BufferParameterId = bufferParameterId,
                    TableName = tableName,
                    Key1Name = key1Name,
                    Key1Value = key1Value,
                    Key2Name = key2Name,
                    Key2Value = key2Value,
                    Key3Name = key3Name,
                    Key3Value = key3Value,
                    UploadedBy = uploadedBy
                },
                transaction
            );
        }


        // ============================================================
        // INSERT COMMODITY MASTER
        // ============================================================

        private async Task InsertCategoryMasterAsync(
            SqlConnection connection,
            SqlTransaction transaction,
            ParameterMaster param,
            string uploadedBy,
            long batchId
        )
        {
            if (
                string.IsNullOrWhiteSpace(
                    param.CommodityCode
                )
            )
            {
                return;
            }


            var exists =
                await connection
                .ExecuteScalarAsync<bool>(
                    @"
SELECT
    CASE
        WHEN EXISTS
        (
            SELECT 1
            FROM CatagoryMST
            WHERE
                CatagoryCode =
                    @CommodityCode
        )
        THEN 1
        ELSE 0
    END
",
                    new
                    {
                        param.CommodityCode
                    },
                    transaction
                );


            if (exists)
            {
                return;
            }


            await connection.ExecuteAsync(
                @"
INSERT INTO CatagoryMST
(
    CatagoryPlant,
    CatagoryCode,
    CatagoryName,
    CatagoryGroupCode,
    UploadDate,
    Visibility,
    UploadBy
)
VALUES
(
    @Plant,
    @CommodityCode,
    @CommodityName,
    @CommodityGroupCode,
    GETDATE(),
    'Y',
    @UploadedBy
)
",
                new
                {
                    Plant =
                        DEFAULT_PLANT_CODE,

                    param.CommodityCode,

                    param.CommodityName,

                    param.CommodityGroupCode,

                    UploadedBy =
                        uploadedBy
                },
                transaction
            );

            await RecordMasterUploadAuditAsync(
                connection,
                transaction,
                batchId,
                param.Id,
                "CatagoryMST",
                "CatagoryCode",
                param.CommodityCode?.Trim(),
                null,
                null,
                null,
                null,
                uploadedBy
            );
        }


        // ============================================================
        // INSERT COMMODITY GROUP
        // ============================================================

        private async Task InsertCommodityGroupAsync(
            SqlConnection connection,
            SqlTransaction transaction,
            ParameterMaster param,
            string uploadedBy,
            long batchId
        )
        {
            if (
                string.IsNullOrWhiteSpace(
                    param.CommodityGroupCode
                )
            )
            {
                return;
            }


            var exists =
                await connection
                .ExecuteScalarAsync<bool>(
                    @"
SELECT
    CASE
        WHEN EXISTS
        (
            SELECT 1
            FROM CommodityGroup
            WHERE
                CommodityGroupCode =
                    @CommodityGroupCode
        )
        THEN 1
        ELSE 0
    END
",
                    new
                    {
                        param.CommodityGroupCode
                    },
                    transaction
                );


            if (exists)
            {
                return;
            }


            await connection.ExecuteAsync(
                @"
INSERT INTO CommodityGroup
(
    CommoditygroupPlant,
    CommodityGroupCode,
    CommodityGroupName,
    Visibility,
    UploadDate,
    UploadBy
)
VALUES
(
    @Plant,
    @CommodityGroupCode,
    @CommodityGroupName,
    'Y',
    GETDATE(),
    @UploadedBy
)
",
                new
                {
                    Plant =
                        DEFAULT_PLANT_CODE,

                    param.CommodityGroupCode,

                    CommodityGroupName =
                        param.CommodityGroup,

                    UploadedBy =
                        uploadedBy
                },
                transaction
            );

            await RecordMasterUploadAuditAsync(
                connection,
                transaction,
                batchId,
                param.Id,
                "CommodityGroup",
                "CommodityGroupCode",
                param.CommodityGroupCode?.Trim(),
                null,
                null,
                null,
                null,
                uploadedBy
            );
        }


        // ============================================================
        // INSERT OHEAD BASIC
        //
        // IMPORTANT:
        // PARAMETER CODE REMAINS FULL 7 CHARACTERS.
        // ============================================================

        private async Task InsertOHeadBasicAsync(
            SqlConnection connection,
            SqlTransaction transaction,
            ParameterMaster param,
            string uploadedBy,
            long batchId
        )
        {
            var headCode =
                string.IsNullOrWhiteSpace(
                    param.ParameterCode
                )
                    ? null
                    : param.ParameterCode.Trim();


            if (
                string.IsNullOrWhiteSpace(
                    headCode
                )
            )
            {
                return;
            }


            var exists =
                await connection
                .ExecuteScalarAsync<bool>(
                    @"
SELECT
    CASE
        WHEN EXISTS
        (
            SELECT 1
            FROM OHEADBasic
            WHERE headcd = @HeadCode
        )
        THEN 1
        ELSE 0
    END
",
                    new
                    {
                        HeadCode =
                            headCode
                    },
                    transaction
                );


            if (exists)
            {
                return;
            }


            await connection.ExecuteAsync(
                @"
INSERT INTO OHEADBasic
(
    headcd,
    headdesc,
    headaliasdesc,
    Visibility,
    UploadDate,
    UploadBy
)
VALUES
(
    @HeadCode,
    @ParameterName,
    @ParameterName,
    'Y',
    GETDATE(),
    @UploadedBy
)
",
                new
                {
                    HeadCode =
                        headCode,

                    param.ParameterName,

                    UploadedBy =
                        uploadedBy
                },
                transaction
            );

            await RecordMasterUploadAuditAsync(
                connection,
                transaction,
                batchId,
                param.Id,
                "OHEADBasic",
                "headcd",
                headCode,
                null,
                null,
                null,
                null,
                uploadedBy
            );
        }


        // ============================================================
        // INSERT SPECIFICATION MASTER
        //
        // SpecHeadCd = FULL Parameter Code
        // SpecMethodCd = Method Code
        // ============================================================

        private async Task InsertSpecificationMasterAsync(
            SqlConnection connection,
            SqlTransaction transaction,
            ParameterMaster param,
            string uploadedBy,
            long batchId
        )
        {
            if (
                string.IsNullOrWhiteSpace(
                    param.SpecificationCode
                )
            )
            {
                return;
            }


            var exists =
                await connection
                .ExecuteScalarAsync<bool>(
                    @"
SELECT
    CASE
        WHEN EXISTS
        (
            SELECT 1
            FROM SpecificationMst
            WHERE
                SpecCode =
                    @SpecificationCode
                AND SpecHeadCd =
                    @ParameterCode
                AND SpecCommodityCd =
                    @CommodityCode
        )
        THEN 1
        ELSE 0
    END
",
                    new
                    {
                        param.SpecificationCode,
                        param.ParameterCode,
                        param.CommodityCode
                    },
                    transaction
                );


            if (exists)
            {
                return;
            }


            var parameterCode =
                string.IsNullOrWhiteSpace(
                    param.ParameterCode
                )
                    ? null
                    : param.ParameterCode.Trim();


            await connection.ExecuteAsync(
                @"
INSERT INTO SpecificationMst
(
    SpecPlantCd,
    SpecHeadCd,
    SpecMethodCd,
    SpecCode,
    SpecName,
    SpecCommodityCd,
    SpecCommodityGroupCode,
    SpecLOQ,
    UploadDate,
    ADD_INFO
)
VALUES
(
    @Plant,
    @ParameterCode,
    @MethodCode,
    @SpecificationCode,
    @SpecificationName,
    @CommodityCode,
    @CommodityGroupCode,
    @Loq,
    GETDATE(),
    @AddInfo
)
",
                new
                {
                    Plant =
                        DEFAULT_PLANT_CODE,

                    ParameterCode =
                        parameterCode,

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

            await RecordMasterUploadAuditAsync(
                connection,
                transaction,
                batchId,
                param.Id,
                "SpecificationMst",
                "SpecCode",
                param.SpecificationCode?.Trim(),
                "SpecHeadCd",
                parameterCode,
                "SpecCommodityCd",
                param.CommodityCode?.Trim(),
                uploadedBy
            );
        }


        // ============================================================
        // INSERT PARAMETER MASTER - OHEADMST
        // ============================================================

        private async Task InsertParameterHeadMasterAsync(
            SqlConnection connection,
            SqlTransaction transaction,
            ParameterMaster param,
            string uploadedBy,
            long batchId
        )
        {
            var headCode =
                string.IsNullOrWhiteSpace(
                    param.ParameterCode
                )
                    ? null
                    : param.ParameterCode.Trim();


            if (
                string.IsNullOrWhiteSpace(
                    headCode
                )
            )
            {
                return;
            }


            var exists =
                await connection
                .ExecuteScalarAsync<bool>(
                    @"
SELECT
    CASE
        WHEN EXISTS
        (
            SELECT 1
            FROM OHEADMST
            WHERE
                headPlantCd = @Plant
                AND headcd = @HeadCode
        )
        THEN 1
        ELSE 0
    END
",
                    new
                    {
                        Plant =
                            DEFAULT_PLANT_CODE,

                        HeadCode =
                            headCode
                    },
                    transaction
                );


            if (exists)
            {
                return;
            }


            // --------------------------------------------------------
            // LAB DISTRIBUTION -> headtestty
            // --------------------------------------------------------

            string? headTestTy = null;


            if (
                !string.IsNullOrWhiteSpace(
                    param.ParameterLabDistribution
                )
            )
            {
                var labDist =
                    param
                    .ParameterLabDistribution
                    .Trim()
                    .ToUpperInvariant();


                if (
                    labDist.Contains("FDS")
                )
                {
                    headTestTy = "F";
                }
                else if (
                    labDist.Contains("MT")
                )
                {
                    headTestTy = "M";
                }
                else if (
                    labDist.Contains("RA")
                )
                {
                    headTestTy = "R";
                }
                else if (
                    labDist.Contains("MB")
                )
                {
                    headTestTy = "B";
                }
                else if (
                    labDist.Contains("WTR")
                )
                {
                    headTestTy = "W";
                }
                else if (
                    labDist.Contains("ENV")
                )
                {
                    headTestTy = "E";
                }
                else if (
                    labDist.Contains("GAS")
                )
                {
                    headTestTy = "G";
                }
            }


            // --------------------------------------------------------
            // REAL DB PATTERN:
            //
            // headQty =
            //     Analysis Qty + Retention Qty
            //
            // headQtyReq =
            //     Analysis Qty
            //
            // headQtyReqRetn =
            //     Retention Qty
            // --------------------------------------------------------

            int? totalSampleQuantity = null;


            if (
                param.SampleQuantityAnalysis.HasValue ||
                param.SampleQuantityRetention.HasValue
            )
            {
                totalSampleQuantity =
                    (
                        param.SampleQuantityAnalysis
                        ?? 0
                    )
                    +
                    (
                        param.SampleQuantityRetention
                        ?? 0
                    );
            }


            // --------------------------------------------------------
            // Current buffer only has "Instrument".
            //
            // REAL DB headInstNo contains short codes such as 0384.
            //
            // Therefore:
            // If supplied Instrument value looks like a short CODE,
            // use it.
            //
            // If it is a description like "Protein Analyzer",
            // DO NOT put that description into headInstNo.
            // --------------------------------------------------------

            string? instrumentCode = null;


            if (
                !string.IsNullOrWhiteSpace(
                    param.Instrument
                )
            )
            {
                var instrumentValue =
                    param.Instrument.Trim();


                if (
                    instrumentValue.Length <= 5
                )
                {
                    instrumentCode =
                        instrumentValue;
                }
            }


            await connection.ExecuteAsync(
                @"
INSERT INTO OHEADMST
(
    headPlantCd,
    headcd,
    headdesc,

    headmethod,

    headtestty,

    headTAT,

    headQty,

    headQtyReq,

    headQtyReqRetn,

    headGroupQty,

    headLOQ,

    headDetectorMode,

    headDetector,

    headInstNo,

    headRate,

    PrintSequence,

    headUnit,

    HEADGROUP,

    HeadDepartment,

    headintype,

    headoutype,

    UploadDate,

    Visibility,

    UploadBy
)
VALUES
(
    @Plant,
    @HeadCode,
    @ParameterName,

    @MethodCode,

    @HeadTestTy,

    @TatDays,

    @TotalSampleQuantity,

    @SampleQuantityAnalysis,

    @SampleQuantityRetention,

    @HeadGroupQty,

    @Loq,

    @DetectorMode,

    @Detector,

    @InstrumentCode,

    @ParameterIndividualRate,

    @ParameterSequence,

    @TestUnit,

    @ParameterGroupCode,

    @LabCode,

    'D',

    'D',

    GETDATE(),

    'Y',

    @UploadedBy
)
",
                new
                {
                    Plant =
                        DEFAULT_PLANT_CODE,

                    HeadCode =
                        headCode,

                    param.ParameterName,

                    // REAL DB:
                    // headmethod stores Method Code
                    param.MethodCode,

                    HeadTestTy =
                        headTestTy,

                    param.TatDays,

                    TotalSampleQuantity =
                        totalSampleQuantity,

                    param.SampleQuantityAnalysis,

                    param.SampleQuantityRetention,

                    // No genuine Group Qty field currently exists
                    // in ParameterMasterBuffer.
                    HeadGroupQty =
                        "-",

                    param.Loq,

                    param.DetectorMode,

                    param.Detector,

                    InstrumentCode =
                        instrumentCode,

                    param.ParameterIndividualRate,

                    param.ParameterSequence,

                    param.TestUnit,

                    param.ParameterGroupCode,

                    param.LabCode,

                    UploadedBy =
                        uploadedBy
                },
                transaction
            );

            await RecordMasterUploadAuditAsync(
                connection,
                transaction,
                batchId,
                param.Id,
                "OHEADMST",
                "headPlantCd",
                DEFAULT_PLANT_CODE,
                "headcd",
                headCode,
                null,
                null,
                uploadedBy
            );
        }


        // ============================================================
        // INSERT REGULATION
        // ============================================================

        private async Task InsertRegulationAsync(
            SqlConnection connection,
            SqlTransaction transaction,
            ParameterMaster param,
            string uploadedBy,
            long batchId
        )
        {
            var regParameter =
                string.IsNullOrWhiteSpace(
                    param.ParameterCode
                )
                    ? null
                    : param.ParameterCode.Trim();


            if (
                string.IsNullOrWhiteSpace(
                    param.RegulationCode
                )
            )
            {
                return;
            }


            var exists =
                await connection
                .ExecuteScalarAsync<bool>(
                    @"
SELECT
    CASE
        WHEN EXISTS
        (
            SELECT 1
            FROM Regulation
            WHERE
                RegulationCode =
                    @RegulationCode

                AND CommodityCode =
                    @CommodityCode

                AND RegParameter =
                    @RegParameter
        )
        THEN 1
        ELSE 0
    END
",
                    new
                    {
                        param.RegulationCode,

                        param.CommodityCode,

                        RegParameter =
                            regParameter
                    },
                    transaction
                );


            if (exists)
            {
                return;
            }


            string? regCommodityParameterN =
                null;


            if (
                !string.IsNullOrWhiteSpace(
                    param.NonFssaiFssaiDrugCode
                )
            )
            {
                regCommodityParameterN =
                    param
                    .NonFssaiFssaiDrugCode
                    .Trim();


                if (
                    regCommodityParameterN
                        .Length > 10
                )
                {
                    regCommodityParameterN =
                        regCommodityParameterN
                        .Substring(0, 10);
                }
            }


            await connection.ExecuteAsync(
                @"
INSERT INTO Regulation
(
    RegPlant,

    RegulationCode,

    CommodityCode,

    RegParameter,

    RegulationName,

    ParameterGroupCode,

    CommodityGroupCode,

    RegParameterGroupRate,

    RegCommodityParameterN,

    UploadDate,

    ADD_INFO
)
VALUES
(
    @Plant,

    @RegulationCode,

    @CommodityCode,

    @RegParameter,

    @RegulationName,

    @ParameterGroupCode,

    @CommodityGroupCode,

    @RegulatoryRateDrug,

    @RegCommodityParameterN,

    GETDATE(),

    @AddInfo
)
",
                new
                {
                    Plant =
                        DEFAULT_PLANT_CODE,

                    param.RegulationCode,

                    param.CommodityCode,

                    RegParameter =
                        regParameter,

                    param.RegulationName,

                    param.ParameterGroupCode,

                    param.CommodityGroupCode,

                    param.RegulatoryRateDrug,

                    RegCommodityParameterN =
                        regCommodityParameterN,

                    param.AddInfo
                },
                transaction
            );

            await RecordMasterUploadAuditAsync(
                connection,
                transaction,
                batchId,
                param.Id,
                "Regulation",
                "RegulationCode",
                param.RegulationCode?.Trim(),
                "CommodityCode",
                param.CommodityCode?.Trim(),
                "RegParameter",
                regParameter,
                uploadedBy
            );
        }


        // ============================================================
        // INSERT CATEGORY PARAMETER
        // ============================================================

        private async Task InsertCategoryParameterAsync(
            SqlConnection connection,
            SqlTransaction transaction,
            ParameterMaster param,
            string uploadedBy,
            long batchId
        )
        {
            var parameterCd =
                string.IsNullOrWhiteSpace(
                    param.ParameterCode
                )
                    ? null
                    : param.ParameterCode.Trim();


            if (
                string.IsNullOrWhiteSpace(
                    param.CommodityCode
                )
                ||
                string.IsNullOrWhiteSpace(
                    parameterCd
                )
            )
            {
                return;
            }


            var exists =
                await connection
                .ExecuteScalarAsync<bool>(
                    @"
SELECT
    CASE
        WHEN EXISTS
        (
            SELECT 1
            FROM CATAGORY_PARAMETER
            WHERE
                CatagoryCD =
                    @CommodityCode

                AND ParameterCD =
                    @ParameterCD
        )
        THEN 1
        ELSE 0
    END
",
                    new
                    {
                        param.CommodityCode,

                        ParameterCD =
                            parameterCd
                    },
                    transaction
                );


            if (exists)
            {
                return;
            }


            string? nablScope =
                null;


            if (
                !string.IsNullOrWhiteSpace(
                    param.NablScopeStatus
                )
            )
            {
                var status =
                    param
                    .NablScopeStatus
                    .Trim()
                    .ToUpperInvariant();


                if (
                    status == "Y"
                    ||
                    status == "YES"
                    ||
                    status == "1"
                )
                {
                    nablScope = "Y";
                }
                else if (
                    status == "N"
                    ||
                    status == "NO"
                    ||
                    status == "0"
                )
                {
                    nablScope = "N";
                }
            }


            await connection.ExecuteAsync(
                @"
INSERT INTO CATAGORY_PARAMETER
(
    Plant,

    CatagoryCD,

    ParameterCD,

    NABL_SCOPE,

    ParameterGroupQty,

    Print_Sequence,

    ParameterRate,

    ParameterRegulatoryRate,

    ParameterGroup,

    CommodityGroupCode,

    OutsourceParameter,

    MethodCode,

    SpecificationCode,

    CommodityParameterN,

    Sp_Code,

    CommodityLabDistCode,

    FSSAICatagoryNo,

    SubClause,

    Specification,

    Test_Unit,

    Test_Code,

    LOQ,

    PARAMSUBGROUP,

    PARAMSUBGROUPCD,

    UploadDate,

    ADD_INFO
)
VALUES
(
    @Plant,

    @CommodityCode,

    @ParameterCD,

    @NablScope,

    @ParameterGroupQty,

    @ParameterSequence,

    @ParameterIndividualRate,

    @RegulatoryRateDrug,

    @ParameterGroupCode,

    @CommodityGroupCode,

    @OutsourceYN,

    @MethodCode,

    @SpecificationCode,

    @CommodityParameterN,

    @SpecificationCode,

    @LabCode,

    @FssaiCategoryNo,

    @SubClause,

    @SpecificationName,

    @TestUnit,

    @TestCode,

    @Loq,

    @ParameterSubGroup,

    @ParameterSubGroupCode,

    GETDATE(),

    @AddInfo
)
",
                new
                {
                    Plant =
                        DEFAULT_PLANT_CODE,

                    param.CommodityCode,

                    ParameterCD =
                        parameterCd,

                    NablScope =
                        nablScope,

                    // Real DB samples use "-"
                    // and this is NOT Analysis Quantity.
                    ParameterGroupQty =
                        "-",

                    param.ParameterSequence,

                    param.ParameterIndividualRate,

                    param.RegulatoryRateDrug,

                    param.ParameterGroupCode,

                    param.CommodityGroupCode,

                    param.OutsourceYN,

                    param.MethodCode,

                    param.SpecificationCode,

                    CommodityParameterN =
                        string.IsNullOrWhiteSpace(
                            param.NonFssaiFssaiDrugCode
                        )
                            ? null
                            : param.NonFssaiFssaiDrugCode.Trim(),

                    param.LabCode,

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

            await RecordMasterUploadAuditAsync(
                connection,
                transaction,
                batchId,
                param.Id,
                "CATAGORY_PARAMETER",
                "CatagoryCD",
                param.CommodityCode?.Trim(),
                "ParameterCD",
                parameterCd,
                null,
                null,
                uploadedBy
            );
        }

        // ============================================================
        // ADMIN SENDS REVERTED BATCH BACK TO REVIEWER
        // ============================================================
        public async Task<ParameterUploadResponse> SendBackToReviewerAsync(
            long batchId,
            string userId,
            string? userSystem,
            string? remarks
        )
        {
            if (!string.Equals(
                    userId?.Trim(),
                    "admin",
                    StringComparison.OrdinalIgnoreCase))
            {
                throw new UnauthorizedAccessException(
                    "Only Admin can send a reverted batch back to Reviewer."
                );
            }

            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            using var transaction = connection.BeginTransaction();

            try
            {
                var log = await connection.QuerySingleOrDefaultAsync<ParameterUploadLog>(
                    @"
SELECT TOP 1
    Id,
    BatchId,
    FileName,
    TotalRows,
    SuccessfulRows,
    FailedRows,
    UploadedBy,
    UploadedAt,
    Status,
    ErrorMessage,
    CurrentStage,
    WorkflowStatus,
    LastActionBy,
    LastActionAt,
    WorkflowRemarks
FROM ParameterUploadBufferLog WITH (UPDLOCK, HOLDLOCK)
WHERE BatchId = @BatchId
ORDER BY Id DESC;",
                    new { BatchId = batchId },
                    transaction
                );

                if (log == null)
                    throw new Exception($"Batch {batchId} was not found.");

                if (!string.Equals(log.CurrentStage, "Admin", StringComparison.OrdinalIgnoreCase) ||
                    !string.Equals(log.WorkflowStatus, "Pending", StringComparison.OrdinalIgnoreCase))
                {
                    throw new Exception(
                        $"Batch {batchId} can be sent back to Reviewer only from Admin / Pending. Current workflow is {log.CurrentStage ?? "Unknown"} / {log.WorkflowStatus ?? "Unknown"}."
                    );
                }

                // This action is intentionally available only after the final master upload
                // has been reverted. A normal Reviewer -> Admin submission must not be sent
                // backwards through this endpoint.
                if (!string.Equals(
                        log.WorkflowRemarks?.Trim(),
                        "Final master upload reverted by Admin",
                        StringComparison.OrdinalIgnoreCase))
                {
                    throw new Exception(
                        $"Batch {batchId} is Admin / Pending, but it was not produced by a final master-upload revert."
                    );
                }

                var parameterCount = await connection.ExecuteScalarAsync<int>(
                    @"
SELECT COUNT(1)
FROM ParameterMasterBuffer
WHERE BatchId = @BatchId;",
                    new { BatchId = batchId },
                    transaction
                );

                if (parameterCount == 0)
                    throw new Exception($"No parameter rows found for batch {batchId}.");

                var workflowRemarks = string.IsNullOrWhiteSpace(remarks)
                    ? "Reverted batch sent back by Admin to Reviewer."
                    : remarks.Trim();

                var affected = await connection.ExecuteAsync(
                    @"
UPDATE ParameterUploadBufferLog
SET
    Status = 'Approved',
    ErrorMessage = NULL,
    CurrentStage = 'Reviewer',
    WorkflowStatus = 'Pending',
    LastActionBy = @UserId,
    LastActionAt = GETDATE(),
    WorkflowRemarks = @WorkflowRemarks
WHERE BatchId = @BatchId
  AND CurrentStage = 'Admin'
  AND WorkflowStatus = 'Pending'
  AND LTRIM(RTRIM(ISNULL(WorkflowRemarks, ''))) = 'Final master upload reverted by Admin';",
                    new
                    {
                        BatchId = batchId,
                        UserId = userId.Trim(),
                        WorkflowRemarks = workflowRemarks
                    },
                    transaction
                );

                if (affected == 0)
                    throw new Exception(
                        "Workflow stage changed before the batch could be sent back. Refresh and try again."
                    );

                await connection.ExecuteAsync(
                    @"
INSERT INTO USERLOG2
(
    USERID,
    USERWRPS,
    USERDATE,
    USERSYSTEM,
    [Change],
    ADD_INFO
)
VALUES
(
    @UserId,
    @UserWrps,
    GETDATE(),
    @UserSystem,
    @Change,
    @AddInfo
);",
                    new
                    {
                        UserId = userId.Trim(),
                        UserWrps = $"PARAM-BATCH-{batchId}",
                        UserSystem = string.IsNullOrWhiteSpace(userSystem)
                            ? "FeasibilityFormApp"
                            : userSystem.Trim(),
                        Change = "Admin Send Back",
                        AddInfo =
                            $"Batch {batchId}: Admin / Pending to Reviewer / Pending. {workflowRemarks}"
                    },
                    transaction
                );

                transaction.Commit();

                return new ParameterUploadResponse
                {
                    UploadLogId = log.Id,
                    TotalRows = parameterCount,
                    SuccessfulRows = parameterCount,
                    FailedRows = 0,
                    Status = "Success",
                    Message = $"Batch {batchId} sent back to Reviewer successfully.",
                    Errors = new List<string>()
                };
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }


        // ============================================================
        // ALL BATCH HISTORY - READ ONLY / AVAILABLE TO EVERY USER
        // ============================================================
        public async Task<IEnumerable<WorkflowTrackerResponse>> GetBatchHistoryAsync(
            string? searchTerm = null,
            int pageNumber = 1,
            int pageSize = 50
        )
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            var offset = (pageNumber - 1) * pageSize;
            var normalizedSearch = searchTerm?.Trim();

            var batchIds = (await connection.QueryAsync<long>(
                @"
SELECT BatchId
FROM
(
    SELECT
        BatchId,
        MAX(Id) AS LatestId,
        MAX(FileName) AS FileName,
        MAX(UploadedBy) AS UploadedBy
    FROM ParameterUploadBufferLog
    GROUP BY BatchId
) B
WHERE
    @SearchTerm IS NULL
    OR @SearchTerm = ''
    OR CAST(BatchId AS VARCHAR(30)) LIKE '%' + @SearchTerm + '%'
    OR ISNULL(FileName, '') LIKE '%' + @SearchTerm + '%'
    OR ISNULL(UploadedBy, '') LIKE '%' + @SearchTerm + '%'
ORDER BY LatestId DESC
OFFSET @Offset ROWS
FETCH NEXT @PageSize ROWS ONLY;",
                new
                {
                    SearchTerm = normalizedSearch,
                    Offset = offset,
                    PageSize = pageSize
                }
            )).ToList();

            var result = new List<WorkflowTrackerResponse>();

            foreach (var id in batchIds)
            {
                var tracker = await GetWorkflowTrackerAsync(id);
                if (tracker != null)
                    result.Add(tracker);
            }

            return result;
        }


        // ============================================================
        // WORKFLOW TRACKER
        // ============================================================
        public async Task<WorkflowTrackerResponse?> GetWorkflowTrackerAsync(
            long batchId
        )
        {
            using var workflowConnection =
                new SqlConnection(_connectionString);

            using var mainConnection =
                new SqlConnection(_mainConnectionString);

            await workflowConnection.OpenAsync();
            await mainConnection.OpenAsync();

            var batch = await workflowConnection.QueryFirstOrDefaultAsync<dynamic>(
                @"
SELECT TOP 1
    BatchId,
    FileName,
    TotalRows,
    SuccessfulRows,
    FailedRows,
    UploadedBy,
    UploadedAt,
    CurrentStage,
    WorkflowStatus,
    LastActionBy,
    LastActionAt,
    WorkflowRemarks
FROM ParameterUploadBufferLog
WHERE BatchId = @BatchId
ORDER BY Id DESC;
",
                new { BatchId = batchId }
            );

            if (batch == null)
                return null;

            var auditRows = (await workflowConnection.QueryAsync<dynamic>(
                @"
SELECT
    USERID AS UserId,
    USERDATE AS UserDate,
    [Change] AS ChangeName,
    ADD_INFO AS Remarks
FROM USERLOG2
WHERE USERWRPS = @BatchRef
  AND [Change] IN
  (
      'Quotation Submit',
      'Lab Submit',
      'Reviewer Submit',
      'Master Upload',
      'Master Revert',
      'Admin Send Back'
  )
ORDER BY USERDATE ASC;
",
                new { BatchRef = $"PARAM-BATCH-{batchId}" }
            )).ToList();

            var userIds = auditRows
                .Select(x => (string?)x.UserId)
                .Where(x => !string.IsNullOrWhiteSpace(x))
                .Select(x => x!.Trim())
                .ToList();

            var uploadedBy = ((string?)batch.UploadedBy)?.Trim();
            if (!string.IsNullOrWhiteSpace(uploadedBy))
                userIds.Add(uploadedBy);

            var lastActionBy = ((string?)batch.LastActionBy)?.Trim();
            if (!string.IsNullOrWhiteSpace(lastActionBy))
                userIds.Add(lastActionBy);

            userIds = userIds
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            var userNames = new Dictionary<string, string>(
                StringComparer.OrdinalIgnoreCase
            );

            if (userIds.Count > 0)
            {
                var dbUsers = await mainConnection.QueryAsync<dynamic>(
                    @"
SELECT
    LTRIM(RTRIM(USERLOGINID)) AS UserId,
    LTRIM(RTRIM(USERNAME)) AS UserName
FROM USERFILE
WHERE USERLOGINID IN @UserIds;
",
                    new { UserIds = userIds }
                );

                foreach (var dbUser in dbUsers)
                {
                    var id = ((string?)dbUser.UserId)?.Trim();
                    var name = ((string?)dbUser.UserName)?.Trim();

                    if (!string.IsNullOrWhiteSpace(id) &&
                        !string.IsNullOrWhiteSpace(name))
                    {
                        userNames[id] = name;
                    }
                }
            }

            // Hard-coded application users are intentionally not in USERFILE.
            userNames["reviewer1"] = "Reviewer 1";
            userNames["admin"] = "Admin";

            string? ResolveName(string? userId)
            {
                if (string.IsNullOrWhiteSpace(userId))
                    return null;

                var id = userId.Trim();

                return userNames.TryGetValue(id, out var name)
                    ? name
                    : id;
            }

            var response = new WorkflowTrackerResponse
            {
                BatchId = batchId,
                FileName = (string?)batch.FileName,
                TotalRows = (int?)batch.TotalRows ?? 0,
                SuccessfulRows = (int?)batch.SuccessfulRows ?? 0,
                FailedRows = (int?)batch.FailedRows ?? 0,
                UploadedBy = uploadedBy,
                UploadedAt = (DateTime?)batch.UploadedAt,
                CurrentStage = (string?)batch.CurrentStage,
                WorkflowStatus = (string?)batch.WorkflowStatus,
                LastActionBy = (string?)batch.LastActionBy,
                LastActionAt = (DateTime?)batch.LastActionAt,
                WorkflowRemarks = (string?)batch.WorkflowRemarks
            };

            // Initial Quotation/Draft owner. This is used while Quotation
            // is still the current stage and no submit audit exists yet.
            response.History.Add(new WorkflowTrackerItem
            {
                Stage = "Quotation",
                Status = "Started",
                UserId = uploadedBy,
                UserName = ResolveName(uploadedBy),
                ActionAt = (DateTime?)batch.UploadedAt,
                Change = "Upload",
                Remarks = "Batch uploaded by Quotation."
            });

            foreach (var row in auditRows)
            {
                var change = ((string?)row.ChangeName)?.Trim();
                var actorId = ((string?)row.UserId)?.Trim();

                string? historyStage = change switch
                {
                    "Quotation Submit" => "Quotation",
                    "Lab Submit" => "Lab",
                    "Reviewer Submit" => "Reviewer",
                    "Master Upload" => "Admin",
                    "Master Revert" => "Admin",
                    "Admin Send Back" => "Admin",
                    _ => null
                };

                if (historyStage == null)
                    continue;

                var historyStatus = change switch
                {
                    "Master Revert" => "Reverted",
                    "Admin Send Back" => "Sent Back",
                    _ => "Completed"
                };

                response.History.Add(new WorkflowTrackerItem
                {
                    Stage = historyStage,
                    Status = historyStatus,
                    UserId = actorId,
                    UserName = ResolveName(actorId),
                    ActionAt = (DateTime?)row.UserDate,
                    Change = change,
                    Remarks = (string?)row.Remarks
                });
            }

            return response;
        }


        // ============================================================
        // SUBMIT QUOTATION BATCH TO LAB
        // ============================================================
        public async Task<ParameterUploadResponse> SubmitToLabAsync(
            long batchId,
            string userId,
            string? userSystem,
            string? remarks
        )
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            using var transaction = connection.BeginTransaction();

            try
            {
                var log = await connection.QuerySingleOrDefaultAsync<ParameterUploadLog>(
                    @"
SELECT TOP 1
    Id,
    BatchId,
    FileName,
    TotalRows,
    SuccessfulRows,
    FailedRows,
    UploadedBy,
    UploadedAt,
    Status,
    ErrorMessage,
    CurrentStage,
    WorkflowStatus,
    LastActionBy,
    LastActionAt,
    WorkflowRemarks
FROM ParameterUploadBufferLog WITH (UPDLOCK, HOLDLOCK)
WHERE BatchId = @BatchId
ORDER BY Id DESC;",
                    new { BatchId = batchId },
                    transaction
                );

                if (log == null)
                    throw new Exception($"Batch {batchId} was not found.");

                if (!string.Equals(
                        log.CurrentStage,
                        "Quotation",
                        StringComparison.OrdinalIgnoreCase))
                {
                    throw new Exception(
                        $"Batch {batchId} cannot be submitted to Lab because its current stage is '{log.CurrentStage ?? "Unknown"}'."
                    );
                }

                var parameterCount = await connection.ExecuteScalarAsync<int>(
                    @"
SELECT COUNT(1)
FROM ParameterMasterBuffer
WHERE BatchId = @BatchId;",
                    new { BatchId = batchId },
                    transaction
                );

                if (parameterCount == 0)
                    throw new Exception($"No parameter rows found for batch {batchId}.");

                var invalidRows = (
                    await connection.QueryAsync<QuotationValidationRow>(
                        @"
SELECT
    Id,
    CONCAT(
        CASE
            WHEN NULLIF(LTRIM(RTRIM(CommodityName)), '') IS NULL
            THEN 'Commodity Name; '
            ELSE ''
        END,
        CASE
            WHEN NULLIF(LTRIM(RTRIM(ParameterName)), '') IS NULL
            THEN 'Parameter Name; '
            ELSE ''
        END,
        CASE
            WHEN NULLIF(LTRIM(RTRIM(ParameterLabDistribution)), '') IS NULL
            THEN 'Lab Name; '
            ELSE ''
        END,
        CASE
            WHEN NULLIF(LTRIM(RTRIM(RegulationName)), '') IS NULL
            THEN 'Regulation Name; '
            ELSE ''
        END,
        CASE
            WHEN
            (
                UPPER(LTRIM(RTRIM(ISNULL(NonFssaiFssaiDrug, '')))) = 'DRUG'
                OR LTRIM(RTRIM(ISNULL(NonFssaiFssaiDrugCode, ''))) = '003'
            )
            AND ParameterIndividualRate IS NULL
            THEN 'Parameter Individual Rate; '
            ELSE ''
        END,
        CASE
            WHEN
            (
                UPPER(LTRIM(RTRIM(ISNULL(NonFssaiFssaiDrug, '')))) = 'DRUG'
                OR LTRIM(RTRIM(ISNULL(NonFssaiFssaiDrugCode, ''))) = '003'
            )
            AND RegulatoryRateDrug IS NULL
            THEN 'Regulatory Rate Drug; '
            ELSE ''
        END
    ) AS Reason
FROM ParameterMasterBuffer
WHERE BatchId = @BatchId
AND
(
    NULLIF(LTRIM(RTRIM(CommodityName)), '') IS NULL
    OR NULLIF(LTRIM(RTRIM(ParameterLabDistribution)), '') IS NULL
    OR NULLIF(LTRIM(RTRIM(RegulationName)), '') IS NULL
    OR
    (
        (
            UPPER(LTRIM(RTRIM(ISNULL(NonFssaiFssaiDrug, '')))) = 'DRUG'
            OR LTRIM(RTRIM(ISNULL(NonFssaiFssaiDrugCode, ''))) = '003'
        )
        AND
        (
            ParameterIndividualRate IS NULL
            OR RegulatoryRateDrug IS NULL
        )
    )
);",
                        new { BatchId = batchId },
                        transaction
                    )
                ).ToList();

                if (invalidRows.Any())
                {
                    var details = string.Join(
                        " | ",
                        invalidRows.Take(20).Select(x =>
                            $"Row Id {x.Id}: {(x.Reason ?? string.Empty).Trim().TrimEnd(';')}"
                        )
                    );

                    throw new Exception(
                        $"Quotation validation failed. {invalidRows.Count} row(s) have missing mandatory fields. {details}"
                    );
                }

                var workflowRemarks = string.IsNullOrWhiteSpace(remarks)
                    ? "Submitted by Quotation team to Lab."
                    : remarks.Trim();

                var affected = await connection.ExecuteAsync(
                    @"
UPDATE ParameterUploadBufferLog
SET
    CurrentStage = 'Lab',
    WorkflowStatus = 'Pending',
    LastActionBy = @UserId,
    LastActionAt = GETDATE(),
    WorkflowRemarks = @WorkflowRemarks
WHERE BatchId = @BatchId
  AND CurrentStage = 'Quotation';",
                    new
                    {
                        BatchId = batchId,
                        UserId = userId,
                        WorkflowRemarks = workflowRemarks
                    },
                    transaction
                );

                if (affected == 0)
                    throw new Exception(
                        "Workflow stage changed before submission. Refresh and try again."
                    );

                await connection.ExecuteAsync(
                    @"
INSERT INTO USERLOG2
(
    USERID,
    USERWRPS,
    USERDATE,
    USERSYSTEM,
    [Change],
    ADD_INFO
)
VALUES
(
    @UserId,
    @UserWrps,
    GETDATE(),
    @UserSystem,
    @Change,
    @AddInfo
);",
                    new
                    {
                        UserId = userId,
                        UserWrps = $"PARAM-BATCH-{batchId}",
                        UserSystem = string.IsNullOrWhiteSpace(userSystem)
                            ? "FeasibilityFormApp"
                            : userSystem.Trim(),
                        Change = "Quotation Submit",
                        AddInfo =
                            $"Batch {batchId}: CurrentStage Quotation to Lab; WorkflowStatus {log.WorkflowStatus ?? "Draft"} to Pending. {workflowRemarks}"
                    },
                    transaction
                );

                transaction.Commit();

                return new ParameterUploadResponse
                {
                    UploadLogId = log.Id,
                    TotalRows = parameterCount,
                    SuccessfulRows = parameterCount,
                    FailedRows = 0,
                    Status = "Success",
                    Message = $"Batch {batchId} submitted to Lab successfully.",
                    Errors = new List<string>()
                };
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }

        // ============================================================
        // SUBMIT LAB BATCH TO REVIEWER
        // ============================================================
        public async Task<ParameterUploadResponse> SubmitToReviewerAsync(
            long batchId,
            string userId,
            string? userSystem,
            string? remarks
        )
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            using var transaction = connection.BeginTransaction();

            try
            {
                var log = await connection.QuerySingleOrDefaultAsync<ParameterUploadLog>(
                    @"
SELECT TOP 1
    Id,
    BatchId,
    FileName,
    TotalRows,
    SuccessfulRows,
    FailedRows,
    UploadedBy,
    UploadedAt,
    Status,
    ErrorMessage,
    CurrentStage,
    WorkflowStatus,
    LastActionBy,
    LastActionAt,
    WorkflowRemarks
FROM ParameterUploadBufferLog WITH (UPDLOCK, HOLDLOCK)
WHERE BatchId = @BatchId
ORDER BY Id DESC;",
                    new { BatchId = batchId },
                    transaction
                );

                if (log == null)
                    throw new Exception($"Batch {batchId} was not found.");

                if (!string.Equals(
                        log.CurrentStage,
                        "Lab",
                        StringComparison.OrdinalIgnoreCase))
                {
                    throw new Exception(
                        $"Batch {batchId} cannot be submitted to Reviewer because its current stage is '{log.CurrentStage ?? "Unknown"}'."
                    );
                }

                if (!string.Equals(
                        log.WorkflowStatus,
                        "Pending",
                        StringComparison.OrdinalIgnoreCase))
                {
                    throw new Exception(
                        $"Batch {batchId} cannot be submitted to Reviewer because its workflow status is '{log.WorkflowStatus ?? "Unknown"}'."
                    );
                }

                var parameterCount = await connection.ExecuteScalarAsync<int>(
                    @"
SELECT COUNT(1)
FROM ParameterMasterBuffer
WHERE BatchId = @BatchId;",
                    new { BatchId = batchId },
                    transaction
                );

                if (parameterCount == 0)
                    throw new Exception($"No parameter rows found for batch {batchId}.");

                var labValidationErrors =
                    (await connection.QueryAsync<string>(
                        @"
SELECT ErrorMessage
FROM
(
    SELECT
        Id,
        CASE
            WHEN NULLIF(LTRIM(RTRIM(ISNULL(ParameterGroup, ''))), '') IS NULL
                THEN 'Parameter Group'
            WHEN NULLIF(LTRIM(RTRIM(ISNULL(ParameterGroupCode, ''))), '') IS NULL
                THEN 'Parameter Group Code'
            WHEN NULLIF(LTRIM(RTRIM(ISNULL(MethodName, ''))), '') IS NULL
                THEN 'Method Name'
            WHEN NULLIF(LTRIM(RTRIM(ISNULL(SpecificationName, ''))), '') IS NULL
                THEN 'Specification Name'
            WHEN NULLIF(LTRIM(RTRIM(ISNULL(TestUnit, ''))), '') IS NULL
                THEN 'Test Unit'
            WHEN Loq IS NULL
                THEN 'LOQ'
            WHEN NULLIF(LTRIM(RTRIM(ISNULL(DetectorMode, ''))), '') IS NULL
                THEN 'DetectorMode'
            WHEN NULLIF(LTRIM(RTRIM(ISNULL(Detector, ''))), '') IS NULL
                THEN 'Detector'
            WHEN SampleQuantityAnalysis IS NULL
                THEN 'Sample Quantity Analysis'
            WHEN SampleQuantityRetention IS NULL
                THEN 'Sample Quantity Retention'
            WHEN NULLIF(LTRIM(RTRIM(ISNULL(RequiredSampleQuantityUnit, ''))), '') IS NULL
                THEN 'Required Sample Quantity Unit'
            WHEN NULLIF(LTRIM(RTRIM(ISNULL(NablScopeStatus, ''))), '') IS NULL
                THEN 'NABL Scope Status'
            WHEN NULLIF(LTRIM(RTRIM(ISNULL(NonFssaiFssaiDrug, ''))), '') IS NULL
                THEN 'Non FSSAI/FSSAI/Drug'
            WHEN NULLIF(LTRIM(RTRIM(ISNULL(FssaiCategoryNo, ''))), '') IS NULL
                THEN 'FSSAI Category No'
            WHEN NULLIF(LTRIM(RTRIM(ISNULL(SubClause, ''))), '') IS NULL
                THEN 'Sub Clause'
            WHEN NULLIF(LTRIM(RTRIM(ISNULL(Instrument, ''))), '') IS NULL
                THEN 'Instrument'
            ELSE NULL
        END AS MissingField,
        CONCAT(
            'Parameter row ID ',
            Id,
            ': ',
            CASE
                WHEN NULLIF(LTRIM(RTRIM(ISNULL(ParameterGroup, ''))), '') IS NULL
                    THEN 'Parameter Group'
                WHEN NULLIF(LTRIM(RTRIM(ISNULL(ParameterGroupCode, ''))), '') IS NULL
                    THEN 'Parameter Group Code'
                WHEN NULLIF(LTRIM(RTRIM(ISNULL(MethodName, ''))), '') IS NULL
                    THEN 'Method Name'
                WHEN NULLIF(LTRIM(RTRIM(ISNULL(SpecificationName, ''))), '') IS NULL
                    THEN 'Specification Name'
                WHEN NULLIF(LTRIM(RTRIM(ISNULL(TestUnit, ''))), '') IS NULL
                    THEN 'Test Unit'
                WHEN Loq IS NULL
                    THEN 'LOQ'
                WHEN SampleQuantityAnalysis IS NULL
                    THEN 'Sample Quantity Analysis'
                WHEN SampleQuantityRetention IS NULL
                    THEN 'Sample Quantity Retention'
                WHEN NULLIF(LTRIM(RTRIM(ISNULL(RequiredSampleQuantityUnit, ''))), '') IS NULL
                    THEN 'Required Sample Quantity Unit'
                WHEN NULLIF(LTRIM(RTRIM(ISNULL(NablScopeStatus, ''))), '') IS NULL
                    THEN 'NABL Scope Status'
                WHEN NULLIF(LTRIM(RTRIM(ISNULL(NonFssaiFssaiDrug, ''))), '') IS NULL
                    THEN 'Non FSSAI/FSSAI/Drug'
                WHEN NULLIF(LTRIM(RTRIM(ISNULL(FssaiCategoryNo, ''))), '') IS NULL
                    THEN 'FSSAI Category No'
                WHEN NULLIF(LTRIM(RTRIM(ISNULL(SubClause, ''))), '') IS NULL
                    THEN 'Sub Clause'
                WHEN NULLIF(LTRIM(RTRIM(ISNULL(Instrument, ''))), '') IS NULL
                    THEN 'Instrument'
            END,
            ' is required.'
        ) AS ErrorMessage
    FROM ParameterMasterBuffer
    WHERE BatchId = @BatchId
) V
WHERE MissingField IS NOT NULL;
",
                        new { BatchId = batchId },
                        transaction
                    )).ToList();

                if (labValidationErrors.Any())
                {
                    throw new Exception(
                        "Lab mandatory field validation failed. " +
                        string.Join(" ", labValidationErrors)
                    );
                }

                var workflowRemarks = string.IsNullOrWhiteSpace(remarks)
                    ? "Submitted by Lab to Reviewer."
                    : remarks.Trim();

                var affected = await connection.ExecuteAsync(
                    @"
UPDATE ParameterUploadBufferLog
SET
    CurrentStage = 'Reviewer',
    WorkflowStatus = 'Pending',
    LastActionBy = @UserId,
    LastActionAt = GETDATE(),
    WorkflowRemarks = @WorkflowRemarks
WHERE BatchId = @BatchId
  AND CurrentStage = 'Lab'
  AND WorkflowStatus = 'Pending';",
                    new
                    {
                        BatchId = batchId,
                        UserId = userId,
                        WorkflowRemarks = workflowRemarks
                    },
                    transaction
                );

                if (affected == 0)
                    throw new Exception(
                        "Workflow stage changed before submission. Refresh and try again."
                    );

                await connection.ExecuteAsync(
                    @"
INSERT INTO USERLOG2
(
    USERID,
    USERWRPS,
    USERDATE,
    USERSYSTEM,
    [Change],
    ADD_INFO
)
VALUES
(
    @UserId,
    @UserWrps,
    GETDATE(),
    @UserSystem,
    @Change,
    @AddInfo
);",
                    new
                    {
                        UserId = userId,
                        UserWrps = $"PARAM-BATCH-{batchId}",
                        UserSystem = string.IsNullOrWhiteSpace(userSystem)
                            ? "FeasibilityFormApp"
                            : userSystem.Trim(),
                        Change = "Lab Submit",
                        AddInfo =
                            $"Batch {batchId}: CurrentStage Lab to Reviewer; WorkflowStatus {log.WorkflowStatus ?? "Pending"} to Pending. {workflowRemarks}"
                    },
                    transaction
                );

                transaction.Commit();

                return new ParameterUploadResponse
                {
                    UploadLogId = log.Id,
                    TotalRows = parameterCount,
                    SuccessfulRows = parameterCount,
                    FailedRows = 0,
                    Status = "Success",
                    Message = $"Batch {batchId} submitted to Reviewer successfully.",
                    Errors = new List<string>()
                };
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }


        // ============================================================
        // SUBMIT REVIEWER BATCH TO ADMIN
        // ============================================================
        public async Task<ParameterUploadResponse> SubmitToAdminAsync(
            long batchId,
            string userId,
            string? userSystem,
            string? remarks
        )
        {
            using var connection = new SqlConnection(_connectionString);
            using var mainConnection = new SqlConnection(_mainConnectionString);

            await connection.OpenAsync();
            await mainConnection.OpenAsync();

            using var transaction = connection.BeginTransaction();

            try
            {
                var log = await connection.QuerySingleOrDefaultAsync<ParameterUploadLog>(
                    @"
SELECT TOP 1
    Id,
    BatchId,
    FileName,
    TotalRows,
    SuccessfulRows,
    FailedRows,
    UploadedBy,
    UploadedAt,
    Status,
    ErrorMessage,
    CurrentStage,
    WorkflowStatus,
    LastActionBy,
    LastActionAt,
    WorkflowRemarks
FROM ParameterUploadBufferLog WITH (UPDLOCK, HOLDLOCK)
WHERE BatchId = @BatchId
ORDER BY Id DESC;",
                    new { BatchId = batchId },
                    transaction
                );

                if (log == null)
                    throw new Exception($"Batch {batchId} was not found.");

                if (!string.Equals(
                        log.CurrentStage,
                        "Reviewer",
                        StringComparison.OrdinalIgnoreCase))
                {
                    throw new Exception(
                        $"Batch {batchId} cannot be submitted to Admin because its current stage is '{log.CurrentStage ?? "Unknown"}'."
                    );
                }

                if (!string.Equals(
                        log.WorkflowStatus,
                        "Pending",
                        StringComparison.OrdinalIgnoreCase))
                {
                    throw new Exception(
                        $"Batch {batchId} cannot be submitted to Admin because its workflow status is '{log.WorkflowStatus ?? "Unknown"}'."
                    );
                }

                var parameterCount = await connection.ExecuteScalarAsync<int>(
                    @"SELECT COUNT(1)
                      FROM ParameterMasterBuffer
                      WHERE BatchId = @BatchId;",
                    new { BatchId = batchId },
                    transaction
                );

                if (parameterCount == 0)
                    throw new Exception($"No parameter rows found for batch {batchId}.");

                var notApprovedCount = await connection.ExecuteScalarAsync<int>(
                    @"SELECT COUNT(1)
                      FROM ParameterMasterBuffer
                      WHERE BatchId = @BatchId
                        AND ISNULL(Status, 'Pending') <> 'Approved';",
                    new { BatchId = batchId },
                    transaction
                );

                if (notApprovedCount > 0)
                {
                    throw new Exception(
                        $"Reviewer must approve all parameters before submitting to Admin. {notApprovedCount} parameter(s) are not approved."
                    );
                }

                // --------------------------------------------------------
                // DUPLICATE PARAMETER CODE CHECK
                // --------------------------------------------------------
                // Before Reviewer can hand the batch to Admin, every
                // non-empty ParameterCode in this batch is checked against
                // the MAIN LIMS parameter master.
                //
                // OHEADBasic.headcd is the master Parameter Code used by
                // the final master-upload flow.
                // --------------------------------------------------------

                var batchParameterCodes =
                    (await connection.QueryAsync<string>(
                        @"
SELECT DISTINCT
    LTRIM(RTRIM(ParameterCode))
FROM ParameterMasterBuffer
WHERE BatchId = @BatchId
  AND NULLIF(LTRIM(RTRIM(ParameterCode)), '') IS NOT NULL
  AND LTRIM(RTRIM(ParameterCode)) <> '-';
",
                        new { BatchId = batchId },
                        transaction
                    ))
                    .Where(code => !string.IsNullOrWhiteSpace(code))
                    .Select(code => code.Trim())
                    .Distinct(StringComparer.OrdinalIgnoreCase)
                    .ToList();

                if (batchParameterCodes.Count > 0)
                {
                    var existingParameterCodes =
                        (await mainConnection.QueryAsync<string>(
                            @"
SELECT DISTINCT
    LTRIM(RTRIM(headcd))
FROM [Efrac_Lims_2025].[dbo].[OHEADBasic]
WHERE LTRIM(RTRIM(headcd)) IN @ParameterCodes;
",
                            new
                            {
                                ParameterCodes = batchParameterCodes
                            }
                        ))
                        .Where(code => !string.IsNullOrWhiteSpace(code))
                        .Select(code => code.Trim())
                        .Distinct(StringComparer.OrdinalIgnoreCase)
                        .OrderBy(code => code)
                        .ToList();

                    if (existingParameterCodes.Count > 0)
                    {
                        throw new Exception(
                            "Cannot submit this batch to Admin. " +
                            "The following Parameter Code(s) already exist in the main database: " +
                            string.Join(", ", existingParameterCodes) +
                            ". Please change the duplicate Parameter Code(s) and save before submitting."
                        );
                    }
                }

                var workflowRemarks = string.IsNullOrWhiteSpace(remarks)
                    ? "Reviewer completed and submitted to Admin."
                    : remarks.Trim();

                var affected = await connection.ExecuteAsync(
                    @"
UPDATE ParameterUploadBufferLog
SET
    CurrentStage = 'Admin',
    WorkflowStatus = 'Pending',
    LastActionBy = @UserId,
    LastActionAt = GETDATE(),
    WorkflowRemarks = @WorkflowRemarks
WHERE BatchId = @BatchId
  AND CurrentStage = 'Reviewer'
  AND WorkflowStatus = 'Pending';",
                    new
                    {
                        BatchId = batchId,
                        UserId = userId,
                        WorkflowRemarks = workflowRemarks
                    },
                    transaction
                );

                if (affected == 0)
                    throw new Exception(
                        "Workflow stage changed before submission. Refresh and try again."
                    );

                await connection.ExecuteAsync(
                    @"
INSERT INTO USERLOG2
(
    USERID,
    USERWRPS,
    USERDATE,
    USERSYSTEM,
    [Change],
    ADD_INFO
)
VALUES
(
    @UserId,
    @UserWrps,
    GETDATE(),
    @UserSystem,
    @Change,
    @AddInfo
);",
                    new
                    {
                        UserId = userId,
                        UserWrps = $"PARAM-BATCH-{batchId}",
                        UserSystem = string.IsNullOrWhiteSpace(userSystem)
                            ? "FeasibilityFormApp"
                            : userSystem.Trim(),
                        Change = "Reviewer Submit",
                        AddInfo =
                            $"Batch {batchId}: CurrentStage Reviewer to Admin; WorkflowStatus {log.WorkflowStatus ?? "Pending"} to Pending. {workflowRemarks}"
                    },
                    transaction
                );

                transaction.Commit();

                return new ParameterUploadResponse
                {
                    UploadLogId = log.Id,
                    TotalRows = parameterCount,
                    SuccessfulRows = parameterCount,
                    FailedRows = 0,
                    Status = "Success",
                    Message = $"Batch {batchId} submitted to Admin successfully.",
                    Errors = new List<string>()
                };
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }

        private sealed class QuotationValidationRow
        {
            public long Id { get; set; }
            public string? Reason { get; set; }
        }

    }
}