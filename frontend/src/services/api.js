import axios from 'axios';
import { API_BASE_URL } from '../constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to ensure responses are parsed correctly
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Standardize text/HTML proxy crashes natively sent by misconfigured backends
    if (error.response && error.response.data && typeof error.response.data === "string") {
      error.response.data = {
        success: false,
        message: "An unexpected server error occurred: Request intercepted by proxy/HTML response.",
        originalError: error.response.data.substring(0, 100) // truncating long HTML blocks
      };
    }
    return Promise.reject(error.response || error);
  }
);

export default api;
