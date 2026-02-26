
export interface ParameterUploadLog {
    id: number;
    fileName: string;
    totalRows: number;
    successfulRows: number;
    failedRows: number;
    uploadedBy: string;
    uploadedAt: string;
    status: string;
    errorMessage: string;
}
