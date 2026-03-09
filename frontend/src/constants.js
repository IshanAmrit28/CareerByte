export const API_BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL || "http://localhost:3000";

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    SIGNUP: "/auth/signup",
    LOGOUT: "/auth/logout",
  },
  INTERVIEW: {
    START: "/interview/start",
    END: "/interview/end",
    GET_REPORT: "/interview",
  },
};