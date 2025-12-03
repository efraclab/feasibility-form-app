export interface CommodityRequest {
  commodityCode?: string;
  commodityGroupCode?: string;
  searchFilter?: string;
  labCode?: string;
  verticalCode?: string;
  regulationCode?: string;
  pageNumber?: number;
  pageSize?: number;
}