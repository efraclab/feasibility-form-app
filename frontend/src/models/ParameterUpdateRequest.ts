import type { ParameterData } from './ParameterData';

export interface ParameterUpdateRequest {
  parameters: ParameterData[];
  updatedBy?: string;
  reviewedBy?: string;
  remarks?: string;
}
