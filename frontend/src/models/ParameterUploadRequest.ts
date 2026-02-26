import type { ParameterData } from './ParameterData';

export interface ParameterUploadRequest {
  parameters: ParameterData[];
  fileName?: string;
  uploadedBy?: string;
}


