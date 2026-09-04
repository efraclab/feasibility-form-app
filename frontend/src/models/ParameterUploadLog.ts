export interface ParameterUploadLog {
    id: number;
    batchId: number;
    fileName: string;
    totalRows: number;
    successfulRows: number;
    failedRows: number;
    uploadedBy: string;
    uploadedAt: string;
    status: string;
    errorMessage: string | null;

    currentStage: string | null;
    workflowStatus: string | null;
    lastActionBy: string | null;
    lastActionAt: string | null;
    workflowRemarks: string | null;
}