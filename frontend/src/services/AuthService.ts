import axios from "axios";
import type { LoginRequest } from "../models/LoginRequest";
import type { LoginResponse } from "../models/LoginResponse";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

export async function login(
  payload: LoginRequest
): Promise<LoginResponse> {
  try {
    const response = await axios.post<LoginResponse>(
      `${API_BASE_URL}/auth/login`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ||
        `Login failed: ${error.message}`
      );
    }
    throw new Error("An unexpected error occurred during login.");
  }
}