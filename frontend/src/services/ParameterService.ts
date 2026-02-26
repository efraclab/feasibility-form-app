import axios from 'axios';
import type { ParameterUploadResponse } from '../models/ParameterUploadResponse';
import type { ParameterData } from '../models/ParameterData';
import type { ParameterUploadLog } from '../models/ParameterUploadLog';
import type { ParameterUploadRequest } from '../models/ParameterUploadRequest';
import type { ParameterUpdateRequest } from '../models/ParameterUpdateRequest';

const API_BASE_URL = 'http://192.168.3.116:5077/api/parameters';


export const uploadParameters = async (
  request: ParameterUploadRequest
): Promise<ParameterUploadResponse> => {
  try {
    //console.log('Uploading parameters:', request);
    const response = await axios.post<ParameterUploadResponse>(
      `${API_BASE_URL}/upload`,
      request,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 300000,
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Upload failed');
    }
    throw error;
  }
};

export const updateParameters = async (
  request: ParameterUpdateRequest
): Promise<string> => {
  try {
    console.log('Updating parameters:', request);
    const response = await axios.put<string>(
      `${API_BASE_URL}`,
      request,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 300000,
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Update failed');
    }
    throw error;
  }
};



export const getUploadLogs = async (
  pageNumber: number = 1,
  pageSize: number = 10
): Promise<ParameterUploadLog[]> => {
  try {
    const response = await axios.get<ParameterUploadLog[]>(
      `${API_BASE_URL}/logs`,
      {
        params: { pageNumber, pageSize },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch logs');
  }
};

export const searchParameters = async (
  employeeId?: string,
  role?: string,
  searchTerm?: string,
  pageNumber: number = 1,
  pageSize: number = 50
): Promise<ParameterData[]> => {
  try {
    console.log(employeeId, role, searchTerm, pageNumber, pageSize)
    const response = await axios.get<ParameterData[]>(
      `${API_BASE_URL}/search`,
      {
        params: {employeeId, role, term: searchTerm, pageNumber, pageSize },
      }
    );
    console.log(response.data)
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to search parameters');
  }
};


export const getParameters = async (
  employeeId?: string,
  role?: string,
  pageNumber: number = 1,
  pageSize: number = 50
): Promise<ParameterData[]> => {
  try {
    const response = await axios.get<ParameterData[]>(
      `${API_BASE_URL}`,
      {
        params: {employeeId, role, pageNumber, pageSize },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch parameters');
  }
};

export const uploadToMaster = async (
  batchId: number,
  uploadedBy: string
): Promise<ParameterUploadResponse> => {
  try {
    console.log(`Uploading batch ${batchId} to master tables by ${uploadedBy}`);
    const response = await axios.post<ParameterUploadResponse>(
      `${API_BASE_URL}/upload-to-master/${batchId}`,
      { uploadedBy },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 300000,
      }
    );
    console.log('Upload to master response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Upload to master error:', error);
    if (error.response?.data) {
      if (error.response.data.message) {
        throw new Error(error.response.data.message);
      }
      if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
        throw new Error(
          error.response.data.errors.join('; ') || 'Upload to master failed'
        );
      }
    }
    throw new Error(error.message || 'Failed to upload to master tables');
  }
};



export const convertExcelRowToParameter = (row: any): ParameterData => {
  return {
    parameterName: row['PARAMETER NAME'] || null,
    parameterCode: row['PARAMETER CODE'] || null,
    parameterGroup: row['PARAMETER GROUP'] || null,
    parameterGroupCode: row['PARAMETER GROUP CODE'] || null,
    parameterSubGroup: row['PARAMETER SUB-GROUP']?.replace(/\n/g, ' ').trim() || null,
    parameterSubGroupCode: row['PARAMETER SUB-GROUP CODE']?.replace(/\n/g, ' ').trim() || null,
    commodityName: row['COMMODITY NAME'] || null,
    commodityCode: row['COMMODITY CODE'] || null,
    commodityGroup: row['COMMODITY GROUP'] || null,
    nonFssaiFssaiDrug: row['NON FSSAI/FSSAI/DRUG'] || null,
    nonFssaiFssaiDrugCode: row['NON FSSAI/FSSAI/DRUG CODE'] || null,
    regulationName: row['REGULATION NAME'] || null,
    regulationCode: row['REGULATION CODE'] || null,
    parameterLabDistribution: row['PARAMETER LAB DISTRIBUTION\n(FDS/MT/RA/MB/WTR/ENV/GAS)']?.replace(/\n/g, ' ').trim() || null,
    labCode: row['LAB CODE'] || null,
    tatDays: row['TAT DAYS'] || null,
    parameterSequence: row['PARAMETER SEQUENCE'] || null,
    outsourceYN: row['OUTSOURCE Y/N'] || null,
    sampleQuantityAnalysis: row['SAMPLE QUANTITY REQUIRED-FOR ANALYSIS'] || null,
    sampleQuantityRetention: row['SAMPLE QUANTITY REQUIRED-FOR RETENTION'] || null,
    requiredSampleQuantityUnit: row['REQUIRED SAMPLE QUANTITY (UNIT)'] || null,
    unitCode: row['UNIT CODE'] || null,
    nablScopeStatus: row['NABL \nSCOPE STATUS']?.replace(/\n/g, ' ').trim() || null,
    methodName: row['METHOD NAME'] || null,
    methodCode: row['METHOD CODE'] || null,
    specificationName: row['SPECIFICATION NAME '] || null,
    specificationCode: row['SPECIFICATION CODE'] || null,
    fssaiCategoryNo: row['FSSAICatagoryNo'] || null,
    subClause: row['SubClause'] || null,
    testUnit: row['Test_Unit'] || null,
    testCode: row['Test_Code'] || null,
    instrument: row['INSTRUMENT'] || null,
    loq: row['LOQ'] || null,
    parameterIndividualRate: row['PARAMETER INDIVIDUAL\nRATE']?.replace(/\n/g, ' ').trim() || null,
    regulatoryRateDrug: row['REGULATORY RATE\n (FOR DRUG)']?.replace(/\n/g, ' ').trim() || null,
    uploadedAt: row['UploadDate'] || null,
    addInfo: row['ADD_INFO'] || null,
  };
};