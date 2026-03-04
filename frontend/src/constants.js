export const BACKEND_API_BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL || "http://localhost:3000";
export const FRONTEND_API_BASE_URL = import.meta.env.VITE_FRONTEND_API_BASE_URL || "http://localhost:3001";

export const API_BASE_URL = BACKEND_API_BASE_URL;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/v1/auth/login",
    SIGNUP: "/api/v1/auth/signup",
    LOGOUT: "/api/v1/auth/logout",
  },
  INTERVIEW: {
    START: "/api/v1/interview/start",
    END: "/api/v1/interview/end",
    GET_REPORT: "/api/v1/interview",
  },
};