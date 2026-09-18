namespace FeasibilityFormApp.Models
{
    public class ParameterMaster
    {
        public long? Id { get; set; }
        public long? BatchId { get; set; }
        public string? ParameterName { get; set; }
        public string? ParameterCode { get; set; }
        public string? ParameterGroup { get; set; }
        public string? ParameterGroupCode { get; set; }
        public string? ParameterSubGroup { get; set; }
        public string? ParameterSubGroupCode { get; set; }
        public string? CommodityName { get; set; }
        public string? CommodityCode { get; set; }
        public string? CommodityGroup { get; set; }
        public string? CommodityGroupCode { get; set; }
        public string? NonFssaiFssaiDrug { get; set; }
        public string? NonFssaiFssaiDrugCode { get; set; }
        public string? RegulationName { get; set; }
        public string? RegulationCode { get; set; }
        public string? ParameterLabDistribution { get; set; }
        public string? LabCode { get; set; }
        public int? TatDays { get; set; }
        public int? ParameterSequence { get; set; }
        public string? OutsourceYN { get; set; }
        public int? SampleQuantityAnalysis { get; set; }
        public int? SampleQuantityRetention { get; set; }
        public string? RequiredSampleQuantityUnit { get; set; }
        public string? UnitCode { get; set; }
        public string? NablScopeStatus { get; set; }
        public string? MethodName { get; set; }
        public string? MethodCode { get; set; }
        public string? SpecificationName { get; set; }
        public string? SpecificationCode { get; set; }
        public string? FssaiCategoryNo { get; set; }
        public string? SubClause { get; set; }
        public string? TestUnit { get; set; }
        public string? TestCode { get; set; }
        public string? Instrument { get; set; }
        public string? Loq { get; set; }
        public string? DetectorMode { get; set; }
        public string? Detector { get; set; }
        public float? ParameterIndividualRate { get; set; }
        public float? RegulatoryRateDrug { get; set; }
        public string? AddInfo { get; set; }
        public DateTime? UploadedAt { get; set; }
        public string? UploadedBy { get; set; }
        public DateTime? LastUpdatedAt { get; set; }
        public string? LastUpdatedBy { get; set; }
        public DateTime? ReviewedAt { get; set; }
        public string? ReviewedBy { get; set; }
        public string? Status { get; set; }
        public string? Remarks { get; set; }
    }
}
