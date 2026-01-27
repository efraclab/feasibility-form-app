import axios from "axios";
import type { LogRequest } from "../models/LogRequest";
import type { LogResponse } from "../models/LogResponse";


const API_BASE_URL = "http://192.168.3.116:5077/api/logs";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 8000,
});


export const fetchLogs = async (
  request: LogRequest
): Promise<LogResponse> => {
  try {
    console.log("Log request:", request);

    const { data } = await api.post<LogResponse>(`/`, request);

    console.log("logs:", data);
    return data;
  } catch (error) {
    console.error("Error fetching logs:", error);
    throw error;
  }
};


api.interceptors.response.use(
  response => response,
  error => {
    console.error(
      "Logs API Error:",
      error.response?.data || error.message
    );
    return Promise.reject(error);
  }
);
