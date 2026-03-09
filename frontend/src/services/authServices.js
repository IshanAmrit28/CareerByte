import api from './api';
import { API_ENDPOINTS } from '../constants';



// Signup service
export const signup = async (userData) => {
  const response = await api.post(API_ENDPOINTS.AUTH.SIGNUP, userData);
  // We don't log in automatically on signup according to the existing Signup.jsx code.
  return response.data;
};

// Login service
export const login = async (userData) => {
  const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, userData);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    // Optionally store minimal user info separately or let AuthContext decode the token / use response.data.user
    localStorage.setItem('user', JSON.stringify(response.data.user)); 
  }
  return response.data;
};

// Logout service
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Get current user (simple synchronous read)
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) return JSON.parse(userStr);
  return null;
};
