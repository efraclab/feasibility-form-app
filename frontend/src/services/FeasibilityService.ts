import axios from 'axios';
import type { ClientDetail } from "../models/ClientDetail";


const API_BASE_URL = 'http://192.168.3.116:5077/api/feasibilities';

export const fetchClients = async (): Promise<ClientDetail[]> => {
  
  try {
    const response = await axios.get<ClientDetail[]>(`${API_BASE_URL}/clients`);
    console.log(response.data)
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
        console.log(error.message)
      throw new Error(error.response?.data?.error || `Failed to fetch clients: ${error.message}`);
    } else {
      throw new Error(`An unexpected error occurred: ${error.message}`);
    }
  }
};


export const fetchSampleTypes = async (): Promise<string[]> => {
  
  try {
    const response = await axios.get<string[]>(`${API_BASE_URL}/sample-types`);
    console.log(response.data)
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
        console.log(error.message)
      throw new Error(error.response?.data?.error || `Failed to fetch sample types: ${error.message}`);
    } else {
      throw new Error(`An unexpected error occurred: ${error.message}`);
    }
  }
};

export const fetchRegulations = async (): Promise<string[]> => {
  
  try {
    const response = await axios.get<string[]>(`${API_BASE_URL}/regulations`);
    console.log(response.data)
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
        console.log(error.message)
      throw new Error(error.response?.data?.error || `Failed to fetch regulations: ${error.message}`);
    } else {
      throw new Error(`An unexpected error occurred: ${error.message}`);
    }
  }
};

export const fetchMethods = async (): Promise<string[]> => {
  
  try {
    const response = await axios.get<string[]>(`${API_BASE_URL}/methods`);
    console.log(response.data)
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
        console.log(error.message)
      throw new Error(error.response?.data?.error || `Failed to fetch methods: ${error.message}`);
    } else {
      throw new Error(`An unexpected error occurred: ${error.message}`);
    }
  }
};

export const fetchSpecifications = async (): Promise<string[]> => {
  
  try {
    const response = await axios.get<string[]>(`${API_BASE_URL}/specifications`);
    console.log(response.data)
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
        console.log(error.message)
      throw new Error(error.response?.data?.error || `Failed to fetch specifications: ${error.message}`);
    } else {
      throw new Error(`An unexpected error occurred: ${error.message}`);
    }
  }
};

export const fetchInstruments = async (): Promise<string[]> => {
  
  try {
    const response = await axios.get<string[]>(`${API_BASE_URL}/instruments`);
    console.log(response.data)
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
        console.log(error.message)
      throw new Error(error.response?.data?.error || `Failed to fetch instruments: ${error.message}`);
    } else {
      throw new Error(`An unexpected error occurred: ${error.message}`);
    }
  }
};

export const fetchLabs = async (): Promise<string[]> => {
  
  try {
    const response = await axios.get<string[]>(`${API_BASE_URL}/labs`);
    console.log(response.data)
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
        console.log(error.message)
      throw new Error(error.response?.data?.error || `Failed to fetch labs: ${error.message}`);
    } else {
      throw new Error(`An unexpected error occurred: ${error.message}`);
    }
  }
};


export const fetchChemicals = async (): Promise<string[]> => {
  
  try {
    const response = await axios.get<string[]>(`${API_BASE_URL}/chemicals`);
    console.log(response.data)
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
        console.log(error.message)
      throw new Error(error.response?.data?.error || `Failed to fetch chemicals: ${error.message}`);
    } else {
      throw new Error(`An unexpected error occurred: ${error.message}`);
    }
  }
};

export const fetchColumns = async (): Promise<string[]> => {
  
  try {
    const response = await axios.get<string[]>(`${API_BASE_URL}/columns`);
    console.log(response.data)
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
        console.log(error.message)
      throw new Error(error.response?.data?.error || `Failed to fetch columns: ${error.message}`);
    } else {
      throw new Error(`An unexpected error occurred: ${error.message}`);
    }
  }
};

export const fetchStandards = async (): Promise<string[]> => {
  
  try {
    const response = await axios.get<string[]>(`${API_BASE_URL}/standards`);
    console.log(response.data)
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
        console.log(error.message)
      throw new Error(error.response?.data?.error || `Failed to fetch standards: ${error.message}`);
    } else {
      throw new Error(`An unexpected error occurred: ${error.message}`);
    }
  }
};