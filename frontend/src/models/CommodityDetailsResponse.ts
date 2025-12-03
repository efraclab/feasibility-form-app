import type { CommodityDetail } from "./CommodityDetail";

export interface CommodityDetailsResponse {
  data: CommodityDetail[];
  count: number;
}