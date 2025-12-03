namespace FeasibilityFormApp.Models
{
    public class CommodityLookupResponse
    {
        public List<string> Commodities { get; set; } = new();
        public List<string> Labs { get; set; } = new();
        public List<string> Verticals { get; set; } = new();
        public List<string> Regulations { get; set; } = new();
    }

}
