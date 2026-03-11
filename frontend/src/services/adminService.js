// frontend/src/services/adminService.js
import { API_ENDPOINTS, API_BASE_URL } from "../constants";

// Helper to get headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

// Admin authentication uses the standard auth routes
export const adminLogin = async (credentials) => {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Failed to login as admin");
  }
  const data = await response.json();
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
  return data;
};

export const adminSignup = async (userData) => {
  const payload = { ...userData, userType: "admin" };
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.SIGNUP}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Failed to signup as admin");
  }
  const data = await response.json();
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
  return data;
};

// ... existing code ...

// Get all users
export const fetchAllUsers = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/users`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }
  return response.json();
};

// Create a new question
export const createQuestion = async (questionData) => {
  const response = await fetch(`${API_BASE_URL}/admin/questions`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(questionData),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Failed to create question");
  }
  return response.json();
};

// Delete a question
export const deleteQuestion = async (id) => {
  const response = await fetch(`${API_BASE_URL}/admin/questions/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error("Failed to delete question");
  }
  return response.json();
};

// Update question category
export const updateQuestionCategory = async (id, category) => {
  const response = await fetch(`${API_BASE_URL}/admin/questions/${id}/category`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ category }),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Failed to update category");
  }
  return response.json();
};

export const fetchAllQuestions = async () => {
    // Fetch directly from the public GET /questions endpoint
    const response = await fetch(`${API_BASE_URL}/questions`, {
      method: "GET",
      // GET requests to questions shouldn't require auth on the backend, but we send headers anyway
      headers: getAuthHeaders(),
    });
    if(!response.ok) {
        throw new Error("Failed to load questions from database.");
    }
    const data = await response.json();
    return { questions: data.data || [] };
};

// ==================== CODING PROBLEMS ====================

export const fetchAllCodingProblems = async () => {
  const response = await fetch(`${API_BASE_URL}/coding-problems`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error("Failed to load coding problems");
  }
  return response.json();
};

export const createCodingProblem = async (problemData) => {
  const response = await fetch(`${API_BASE_URL}/coding-problems`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(problemData),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Failed to create coding problem");
  }
  return response.json();
};

export const deleteCodingProblem = async (id) => {
  const response = await fetch(`${API_BASE_URL}/coding-problems/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error("Failed to delete coding problem");
  }
  return response.json();
};
