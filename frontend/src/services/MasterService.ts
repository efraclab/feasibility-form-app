import type { CommodityRequest } from "../models/CommodityRequest";
import type { CommodityDetailsResponse } from "../models/CommodityDetailsResponse";
import type { DropdownOption } from "../models/DropdownOption";
import type { FilterState } from "../models/FilterState";


const API_BASE_URL = 'http://192.168.3.116:5077/api/master';

export const fetchCommodityDetails = async (
  request: CommodityRequest
): Promise<CommodityDetailsResponse> => {
  try {
    console.log(request)
    const response = await fetch(`${API_BASE_URL}/commodity-details`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("commodity-details", data)
    return data;
  } catch (error) {
    console.error('Error fetching commodity details:', error);
    throw error;
  }
};

export const fetchCommodityOptions = async (
  commodityGroupCode?: string
): Promise<DropdownOption[]> => {
  try {
    console.log("commodityGroupCode", commodityGroupCode);

    const url = commodityGroupCode
      ? `${API_BASE_URL}/commodities?commodityGroupCode=${commodityGroupCode}`
      : `${API_BASE_URL}/commodities`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    console.log("size", data.length);

    return data;
  } catch (error) {
    console.error("Error fetching commodity options:", error);
    throw error;
  }
};



export const fetchCommodityGroupOptions = async (): Promise<DropdownOption[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/commodity-groups`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching commodity group options:', error);
    throw error;
  }
};

export const fetchLabOptions = async (): Promise<DropdownOption[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/labs`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching lab options:', error);
    throw error;
  }
};

export const fetchRegulationOptions = async (): Promise<DropdownOption[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/regulations`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching regulation options:', error);
    throw error;
  }
};

export const fetchVerticalOptions = async (): Promise<DropdownOption[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/verticals`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching vertical options:', error);
    throw error;
  }
};


export const buildCommodityRequest = (
  filters: FilterState,
  pageNumber: number,
  pageSize: number
) => {
  return {
    commodityCode: filters.commodity || null,
    commodityGroupCode: filters.commodityGroup || null,
    regulationCode: filters.regulation || null,
    verticalCode: filters.vertical || null,
    searchFilter: filters.searchFilter || null,
    pageNumber: pageNumber,
    pageSize: pageSize,
  };
};


export const getPaginationText = (
  currentPage: number,
  pageSize: number,
  totalRecords: number
): { from: number; to: number; total: number } => {
  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalRecords);
  return { from, to, total: totalRecords };
};
