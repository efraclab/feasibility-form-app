
export interface ParameterUploadResponse {
    uploadLogId: number;
    totalRows: number;
    successfulRows: number;
    failedRows: number;
    status: string;
    message: string;
    errors?: string[];
}
