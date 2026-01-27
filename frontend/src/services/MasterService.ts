import axios from "axios";
import type { CommodityRequest } from "../models/CommodityRequest";
import type { CommodityDetailsResponse } from "../models/CommodityDetailsResponse";
import type { DropdownOption } from "../models/DropdownOption";
import type { FilterState } from "../models/FilterState";


const API_BASE_URL = "http://192.168.3.116:5077/api/master";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 8000,
});


export const fetchCommodityDetails = async (
  request: CommodityRequest
): Promise<CommodityDetailsResponse> => {
  try {
    console.log("Request:", request);

    const { data } = await api.post<CommodityDetailsResponse>(
      "/commodity-details",
      request
    );

    console.log("commodity-details:", data);
    return data;
  } catch (error) {
    console.error("Error fetching commodity details:", error);
    throw error;
  }
};

export const fetchCommodityOptions = async (
  commodityGroupCode?: string
): Promise<DropdownOption[]> => {
  try {
    const { data } = await api.get<DropdownOption[]>("/commodities", {
      params: commodityGroupCode
        ? { commodityGroupCode }
        : undefined,
    });

    console.log("commodities count:", data.length);
    return data;
  } catch (error) {
    console.error("Error fetching commodity options:", error);
    throw error;
  }
};

export const fetchCommodityGroupOptions = async (): Promise<DropdownOption[]> => {
  try {
    const { data } = await api.get<DropdownOption[]>("/commodity-groups");
    return data;
  } catch (error) {
    console.error("Error fetching commodity group options:", error);
    throw error;
  }
};

export const fetchLabOptions = async (): Promise<DropdownOption[]> => {
  try {
    const { data } = await api.get<DropdownOption[]>("/labs");
    return data;
  } catch (error) {
    console.error("Error fetching lab options:", error);
    throw error;
  }
};

export const fetchRegulationOptions = async (): Promise<DropdownOption[]> => {
  try {
    const { data } = await api.get<DropdownOption[]>("/regulations");
    return data;
  } catch (error) {
    console.error("Error fetching regulation options:", error);
    throw error;
  }
};

export const fetchVerticalOptions = async (): Promise<DropdownOption[]> => {
  try {
    const { data } = await api.get<DropdownOption[]>("/verticals");
    return data;
  } catch (error) {
    console.error("Error fetching vertical options:", error);
    throw error;
  }
};


export const buildCommodityRequest = (
  filters: FilterState,
  // pageNumber: number,
  // pageSize: number
): CommodityRequest => ({
  commodityCode: filters.commodity,
  commodityGroupCode: filters.commodityGroup,
  regulationCode: filters.regulation,
  verticalCode: filters.vertical,
  searchFilter: filters.searchFilter,
  // pageNumber,
  // pageSize,
});

export const getPaginationText = (
  currentPage: number,
  pageSize: number,
  totalRecords: number
): { from: number; to: number; total: number } => {
  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalRecords);
  return { from, to, total: totalRecords };
};


api.interceptors.response.use(
  response => response,
  error => {
    console.error(
      "API Error:",
      error.response?.data || error.message
    );
    return Promise.reject(error);
  }
);
