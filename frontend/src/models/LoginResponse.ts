export interface LoginResponse {
  token: string;
  message?: string;
  [key: string]: any;
}