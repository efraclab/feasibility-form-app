import axios from 'axios';

import type {
  ParameterUploadResponse,
} from '../models/ParameterUploadResponse';

import type {
  ParameterData,
} from '../models/ParameterData';

import type {
  ParameterUploadLog,
} from '../models/ParameterUploadLog';

import type {
  ParameterUploadRequest,
} from '../models/ParameterUploadRequest';

import type {
  ParameterUpdateRequest,
} from '../models/ParameterUpdateRequest';


const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/parameters`;


export interface DropdownOption {
  code: string;
  name: string;
}


export interface ParameterDropdownOptions {
  parameterCodes: DropdownOption[];
  parameterGroupCodes: DropdownOption[];
  parameterSubGroupCodes: DropdownOption[];
  commodityCodes: DropdownOption[];
  commodityGroupCodes: DropdownOption[];
  nonFssaiFssaiDrugCodes: DropdownOption[];
  regulationCodes: DropdownOption[];
  labCodes: DropdownOption[];
  unitCodes: DropdownOption[];
  methodCodes: DropdownOption[];
  specificationCodes: DropdownOption[];
  testCodes: DropdownOption[];
  loqOptions: DropdownOption[];
  detectorModeOptions: DropdownOption[];
  detectorOptions: DropdownOption[];
}


function getApiErrorMessage(
  error: unknown,
  fallbackMessage: string
): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error
      ? error.message
      : fallbackMessage;
  }


  console.error('API request failed:', {
    message: error.message,
    code: error.code,
    status: error.response?.status,
    statusText: error.response?.statusText,
    responseData: error.response?.data,
    requestUrl: error.config?.url,
  });


  if (!error.response) {
    if (error.code === 'ECONNABORTED') {
      return 'The request timed out. Please try again.';
    }

    return (
      'Could not connect to the server at ' +
      '192.168.3.250:5077. Check whether the backend is running.'
    );
  }


  const status = error.response.status;
  const data = error.response.data;


  if (status === 413) {
    return 'The uploaded file is too large for the server.';
  }


  if (status === 404) {
    return 'The requested API endpoint was not found.';
  }


  if (status === 401) {
    return 'You are not authorized to perform this action.';
  }


  if (status === 403) {
    return 'You do not have permission to perform this action.';
  }


  if (typeof data === 'string') {
    if (data.trim().startsWith('<')) {
      return `Server returned HTTP ${status} ${error.response.statusText}`;
    }

    return data.trim() || fallbackMessage;
  }


  if (data && typeof data === 'object') {
    const responseData = data as {
      message?: string;
      Message?: string;
      title?: string;
      Title?: string;
      errors?: string[] | Record<string, string[]>;
      Errors?: string[] | Record<string, string[]>;
    };


    const message =
      responseData.message ??
      responseData.Message ??
      responseData.title ??
      responseData.Title;


    const errors =
      responseData.errors ??
      responseData.Errors;


    let errorDetails = '';


    if (Array.isArray(errors)) {
      errorDetails = errors
        .filter(Boolean)
        .join('; ');
    } else if (
      errors &&
      typeof errors === 'object'
    ) {
      errorDetails = Object.entries(errors)
        .flatMap(([field, messages]) => {
          if (Array.isArray(messages)) {
            return messages.map(
              (item) => `${field}: ${item}`
            );
          }

          return [];
        })
        .join('; ');
    }


    if (message && errorDetails) {
      return `${message}: ${errorDetails}`;
    }


    if (message) {
      return message;
    }


    if (errorDetails) {
      return errorDetails;
    }
  }


  return `${fallbackMessage} (HTTP ${status})`;
}


/* =====================================================
   UPLOAD PARAMETERS
===================================================== */

export const uploadParameters = async (
  request: ParameterUploadRequest
): Promise<ParameterUploadResponse> => {
  try {
    console.log(
      'Uploading parameters:',
      request
    );


    const response =
      await axios.post<ParameterUploadResponse>(
        `${API_BASE_URL}/upload`,
        request,
        {
          headers: {
            'Content-Type':
              'application/json',
          },
          timeout: 300000,
        }
      );


    return response.data;
  } catch (error: unknown) {
    throw new Error(
      getApiErrorMessage(
        error,
        'Parameter upload failed'
      )
    );
  }
};


/* =====================================================
   UPDATE PARAMETERS
===================================================== */

export const updateParameters = async (
  request: ParameterUpdateRequest
): Promise<string> => {
  try {
    console.log(
      'Updating parameters:',
      request
    );


    const response =
      await axios.put<string>(
        API_BASE_URL,
        request,
        {
          headers: {
            'Content-Type':
              'application/json',
          },
          timeout: 300000,
        }
      );


    return response.data;
  } catch (error: unknown) {
    throw new Error(
      getApiErrorMessage(
        error,
        'Parameter update failed'
      )
    );
  }
};


/* =====================================================
   GET UPLOAD LOGS
===================================================== */

export const getUploadLogs = async (
  pageNumber: number = 1,
  pageSize: number = 10
): Promise<ParameterUploadLog[]> => {
  try {
    const response =
      await axios.get<ParameterUploadLog[]>(
        `${API_BASE_URL}/logs`,
        {
          params: {
            pageNumber,
            pageSize,
          },
        }
      );


    return response.data;
  } catch (error: unknown) {
    throw new Error(
      getApiErrorMessage(
        error,
        'Failed to fetch upload logs'
      )
    );
  }
};


/* =====================================================
   SEARCH PARAMETERS
===================================================== */

export const searchParameters = async (
  employeeId?: string,
  role?: string,
  searchTerm?: string,
  pageNumber: number = 1,
  pageSize: number = 50
): Promise<ParameterData[]> => {
  try {
    const response =
      await axios.get<ParameterData[]>(
        `${API_BASE_URL}/search`,
        {
          params: {
            employeeId,
            role,
            term: searchTerm,
            pageNumber,
            pageSize,
          },
        }
      );


    return response.data;
  } catch (error: unknown) {
    throw new Error(
      getApiErrorMessage(
        error,
        'Failed to search parameters'
      )
    );
  }
};


/* =====================================================
   GET PARAMETERS
===================================================== */

export const getParameters = async (
  employeeId?: string,
  role?: string,
  pageNumber: number = 1,
  pageSize: number = 50
): Promise<ParameterData[]> => {
  try {
    const response =
      await axios.get<ParameterData[]>(
        API_BASE_URL,
        {
          params: {
            employeeId,
            role,
            pageNumber,
            pageSize,
          },
        }
      );


    return response.data;
  } catch (error: unknown) {
    throw new Error(
      getApiErrorMessage(
        error,
        'Failed to fetch parameters'
      )
    );
  }
};


/* =====================================================
   DROPDOWN OPTIONS
===================================================== */

export const getDropdownOptions =
  async (): Promise<ParameterDropdownOptions> => {
    try {
      const response =
        await axios.get<ParameterDropdownOptions>(
          `${API_BASE_URL}/dropdown-options`,
          {
            timeout: 300000,
          }
        );


      return response.data;
    } catch (error: unknown) {
      throw new Error(
        getApiErrorMessage(
          error,
          'Failed to fetch dropdown options'
        )
      );
    }
  };


export interface WorkflowTrackerItem {
  stage: 'Quotation' | 'Lab' | 'Reviewer' | 'Admin';
  status: string;
  userId?: string | null;
  userName?: string | null;
  actionAt?: string | null;
  change?: string | null;
  remarks?: string | null;
}

export interface WorkflowTrackerResponse {
  batchId: number;
  fileName?: string | null;
  totalRows?: number;
  successfulRows?: number;
  failedRows?: number;
  uploadedBy?: string | null;
  uploadedAt?: string | null;
  currentStage?: string | null;
  workflowStatus?: string | null;
  lastActionBy?: string | null;
  lastActionAt?: string | null;
  workflowRemarks?: string | null;
  history: WorkflowTrackerItem[];
}

export const getWorkflowTracker = async (
  batchId: number
): Promise<WorkflowTrackerResponse> => {
  try {
    const response =
      await axios.get<WorkflowTrackerResponse>(
        `${API_BASE_URL}/workflow/${batchId}/tracker`,
        { timeout: 300000 }
      );

    return response.data;
  } catch (error: unknown) {
    throw new Error(
      getApiErrorMessage(
        error,
        'Failed to fetch workflow tracker'
      )
    );
  }
};


export const getBatchHistory = async (
  searchTerm = '',
  pageNumber = 1,
  pageSize = 50
): Promise<WorkflowTrackerResponse[]> => {
  try {
    const response =
      await axios.get<WorkflowTrackerResponse[]>(
        `${API_BASE_URL}/workflow/history`,
        {
          params: { searchTerm, pageNumber, pageSize },
          timeout: 300000,
        }
      );

    return Array.isArray(response.data) ? response.data : [];
  } catch (error: unknown) {
    throw new Error(
      getApiErrorMessage(
        error,
        'Failed to fetch batch history'
      )
    );
  }
};


/* =====================================================
   UPLOAD TO MASTER TABLES
===================================================== */

export const uploadToMaster = async (
  batchId: number,
  uploadedBy: string
): Promise<ParameterUploadResponse> => {
  try {
    console.log(
      `Uploading batch ${batchId} to master tables`
    );


    const response =
      await axios.post<ParameterUploadResponse>(
        `${API_BASE_URL}/upload-to-master/${batchId}`,
        {
          uploadedBy,
        },
        {
          headers: {
            'Content-Type':
              'application/json',
          },
          timeout: 300000,
        }
      );


    return response.data;
  } catch (error: unknown) {
    throw new Error(
      getApiErrorMessage(
        error,
        'Failed to upload parameters to master tables'
      )
    );
  }
};


/* =====================================================
   REVERT FINAL MASTER UPLOAD
===================================================== */

export const revertMasterUpload = async (
  batchId: number,
  userId: string
): Promise<ParameterUploadResponse> => {
  try {
    const response =
      await axios.post<ParameterUploadResponse>(
        `${API_BASE_URL}/revert-master-upload/${batchId}`,
        {
          userId,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 300000,
        }
      );

    return response.data;
  } catch (error: unknown) {
    throw new Error(
      getApiErrorMessage(
        error,
        'Failed to revert final master upload'
      )
    );
  }
};


/* =====================================================
   ADMIN SENDS REVERTED BATCH BACK TO REVIEWER
===================================================== */

export interface SendBackToReviewerRequest {
  userId: string;
  remarks?: string | null;
}

export const sendBackToReviewer = async (
  batchId: number,
  request: SendBackToReviewerRequest
): Promise<ParameterUploadResponse> => {
  try {
    const response =
      await axios.post<ParameterUploadResponse>(
        `${API_BASE_URL}/workflow/${batchId}/send-back-to-reviewer`,
        request,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 300000,
        }
      );

    return response.data;
  } catch (error: unknown) {
    throw new Error(
      getApiErrorMessage(
        error,
        'Failed to send batch back to Reviewer'
      )
    );
  }
};


/* =====================================================
   SUBMIT QUOTATION BATCH TO LAB
===================================================== */

export interface SubmitToLabRequest {
  userId: string;
  remarks?: string | null;
}

export const submitToLab = async (
  batchId: number,
  request: SubmitToLabRequest
): Promise<ParameterUploadResponse> => {
  try {
    const response =
      await axios.post<ParameterUploadResponse>(
        `${API_BASE_URL}/workflow/${batchId}/submit-to-lab`,
        request,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 300000,
        }
      );

    return response.data;
  } catch (error: unknown) {
    throw new Error(
      getApiErrorMessage(
        error,
        'Failed to submit batch to Lab'
      )
    );
  }
};


/* =====================================================
   SUBMIT LAB BATCH TO REVIEWER
===================================================== */

export interface SubmitToReviewerRequest {
  userId: string;
  remarks?: string | null;
}

export const submitToReviewer = async (
  batchId: number,
  request: SubmitToReviewerRequest
): Promise<ParameterUploadResponse> => {
  try {
    const response =
      await axios.post<ParameterUploadResponse>(
        `${API_BASE_URL}/workflow/${batchId}/submit-to-reviewer`,
        request,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 300000,
        }
      );

    return response.data;
  } catch (error: unknown) {
    throw new Error(
      getApiErrorMessage(
        error,
        'Failed to submit batch to Reviewer'
      )
    );
  }
};


/* =====================================================
   SUBMIT REVIEWER BATCH TO ADMIN
===================================================== */

export interface SubmitToAdminRequest {
  userId: string;
  remarks?: string | null;
}

export const submitToAdmin = async (
  batchId: number,
  request: SubmitToAdminRequest
): Promise<ParameterUploadResponse> => {
  try {
    const response =
      await axios.post<ParameterUploadResponse>(
        `${API_BASE_URL}/workflow/${batchId}/submit-to-admin`,
        request,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 300000,
        }
      );

    return response.data;
  } catch (error: unknown) {
    throw new Error(
      getApiErrorMessage(
        error,
        'Failed to submit batch to Admin'
      )
    );
  }
};


/* =====================================================
   CONVERT EXCEL ROW
===================================================== */

export const convertExcelRowToParameter = (
  row: Record<string, any>
): ParameterData => {
  return {
    parameterName:
      row['PARAMETER NAME'] || null,

    parameterCode:
      row['PARAMETER CODE'] || null,

    parameterGroup:
      row['PARAMETER GROUP'] || null,

    parameterGroupCode:
      row['PARAMETER GROUP CODE'] ||
      null,

    parameterSubGroup:
      row['PARAMETER SUB-GROUP']
        ?.toString()
        .replace(/\n/g, ' ')
        .trim() || null,

    parameterSubGroupCode:
      row['PARAMETER SUB-GROUP CODE']
        ?.toString()
        .replace(/\n/g, ' ')
        .trim() || null,

    commodityName:
      row['COMMODITY NAME'] || null,

    commodityCode:
      row['COMMODITY CODE'] || null,

    commodityGroup:
      row['COMMODITY GROUP'] || null,

    commodityGroupCode:
      row['COMMODITY GROUP CODE'] ||
      null,

    nonFssaiFssaiDrug:
      row['NON FSSAI/FSSAI/DRUG'] ||
      null,

    nonFssaiFssaiDrugCode:
      row[
        'NON FSSAI/FSSAI/DRUG CODE'
      ] || null,

    regulationName:
      row['REGULATION NAME'] || null,

    regulationCode:
      row['REGULATION CODE'] || null,

    // Quotation template now has a separate LAB NAME column.
    // ParameterData currently stores the selected lab name in
    // parameterLabDistribution, so prefer LAB NAME and keep the
    // original Parameter Lab Distribution column as a fallback for
    // older/existing Excel files.
    parameterLabDistribution:
      row['LAB NAME']
        ?.toString()
        .replace(/\n/g, ' ')
        .trim() ||
      row[
        'PARAMETER LAB DISTRIBUTION (FDS/MT/RA/MB/WTR/ENV/GAS)'
      ]
        ?.toString()
        .replace(/\n/g, ' ')
        .trim() ||
      row[
        'PARAMETER LAB DISTRIBUTION\n(FDS/MT/RA/MB/WTR/ENV/GAS)'
      ]
        ?.toString()
        .replace(/\n/g, ' ')
        .trim() ||
      null,

    labCode:
      row['LAB CODE']
        ?.toString()
        .trim() || null,

    tatDays:
      row['TAT DAYS'] ?? null,

    parameterSequence:
      row['PARAMETER SEQUENCE'] ?? null,

    outsourceYN:
      row['OUTSOURCE Y/N'] || null,

    sampleQuantityAnalysis:
      row[
        'SAMPLE QUANTITY REQUIRED-FOR ANALYSIS'
      ] ?? null,

    sampleQuantityRetention:
      row[
        'SAMPLE QUANTITY REQUIRED-FOR RETENTION'
      ] ?? null,

    requiredSampleQuantityUnit:
      row[
        'REQUIRED SAMPLE QUANTITY (UNIT)'
      ] || null,

    unitCode:
      row['UNIT CODE'] || null,

    nablScopeStatus:
      row['NABL \nSCOPE STATUS']
        ?.toString()
        .replace(/\n/g, ' ')
        .trim() ||
      row['NABL SCOPE STATUS']
        ?.toString()
        .replace(/\n/g, ' ')
        .trim() ||
      null,

    methodName:
      row['METHOD NAME'] || null,

    methodCode:
      row['METHOD CODE'] || null,

    specificationName:
      row['SPECIFICATION NAME '] ||
      row['SPECIFICATION NAME'] ||
      null,

    specificationCode:
      row['SPECIFICATION CODE'] ||
      null,

    fssaiCategoryNo:
      row['FSSAICatagoryNo'] || null,

    subClause:
      row['SubClause'] || null,

    testUnit:
      row['Test_Unit'] || null,

    testCode:
      row['Test_Code'] || null,

    instrument:
      row['INSTRUMENT'] || null,

    loq:
      row['LOQ'] ?? null,

    detectorMode:
      row['DetectorMode']
        ?.toString()
        .trim() ||
      row['DETECTOR MODE']
        ?.toString()
        .trim() ||
      row['DETECTORMODE']
        ?.toString()
        .trim() ||
      null,

    detector:
      row['Detector']
        ?.toString()
        .trim() ||
      row['DETECTOR']
        ?.toString()
        .trim() ||
      null,

    parameterIndividualRate:
      row['PARAMETER INDIVIDUAL RATE']
        ?.toString()
        .trim() ||
      row['PARAMETER INDIVIDUAL\nRATE']
        ?.toString()
        .replace(/\n/g, ' ')
        .trim() ||
      null,

    regulatoryRateDrug:
      row['REGULATORY RATE (FOR DRUG)']
        ?.toString()
        .trim() ||
      row['REGULATORY RATE\n (FOR DRUG)']
        ?.toString()
        .replace(/\n/g, ' ')
        .trim() ||
      null,

    uploadedAt:
      row['UploadDate'] || null,

    addInfo:
      row['ADD_INFO'] || null,
  };
};