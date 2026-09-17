namespace FeasibilityFormApp.Models
{
    public class ParameterDropdownOption
    {
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
    }

public class ParameterDropdownOptions
{
    public IEnumerable<ParameterDropdownOption> ParameterCodes { get; set; }
        = new List<ParameterDropdownOption>();

    public IEnumerable<ParameterDropdownOption> ParameterGroupCodes { get; set; }
        = new List<ParameterDropdownOption>();

    public IEnumerable<ParameterDropdownOption> ParameterSubGroupCodes { get; set; }
        = new List<ParameterDropdownOption>();

    public IEnumerable<ParameterDropdownOption> CommodityCodes { get; set; }
        = new List<ParameterDropdownOption>();

    public IEnumerable<ParameterDropdownOption> CommodityGroupCodes { get; set; }
        = new List<ParameterDropdownOption>();

    public IEnumerable<ParameterDropdownOption> NonFssaiFssaiDrugCodes { get; set; }
        = new List<ParameterDropdownOption>();

    public IEnumerable<ParameterDropdownOption> RegulationCodes { get; set; }
        = new List<ParameterDropdownOption>();

    public IEnumerable<ParameterDropdownOption> LabCodes { get; set; }
        = new List<ParameterDropdownOption>();

    public IEnumerable<ParameterDropdownOption> UnitCodes { get; set; }
        = new List<ParameterDropdownOption>();

    public IEnumerable<ParameterDropdownOption> MethodCodes { get; set; }
        = new List<ParameterDropdownOption>();

    public IEnumerable<ParameterDropdownOption> SpecificationCodes { get; set; }
        = new List<ParameterDropdownOption>();

    public IEnumerable<ParameterDropdownOption> TestCodes { get; set; }
        = new List<ParameterDropdownOption>();

    public IEnumerable<ParameterDropdownOption> LoqOptions { get; set; }
        = new List<ParameterDropdownOption>();
}
}