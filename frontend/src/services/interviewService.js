// frontend/src/services/interviewService.js
import { BACKEND_API_BASE_URL, API_ENDPOINTS } from "../constants";

// Helper function to send multipart form data (required for file upload)
export async function startInterview(formData) {
  const url = `${BACKEND_API_BASE_URL}${API_ENDPOINTS.INTERVIEW.START}`;

  // Note: We use raw fetch here and DON'T set Content-Type for FormData
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${localStorage.getItem('token')}`,
    },
    body: formData,
  });

  if (!response.ok) {
    let errorBody = await response.text();
    throw new Error(
      `Failed to start interview: ${response.status} - ${errorBody}`
    );
  }

  return response.json();
}

// Sends the final report structure (questions + answers) for grading
export async function endInterview(reportPayload) {
  const url = `${BACKEND_API_BASE_URL}${API_ENDPOINTS.INTERVIEW.END}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${localStorage.getItem('token')}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(reportPayload),
  });

  if (!response.ok) {
    let errorBody = await response.text();
    throw new Error(
      `Failed to end interview: ${response.status} - ${errorBody}`
    );
  }

  return response.json();
}

// Fetches the final graded report
export async function fetchReport(reportId) {
  const url = `${BACKEND_API_BASE_URL}${API_ENDPOINTS.INTERVIEW.GET_REPORT}/${reportId}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${localStorage.getItem('token')}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch report ${reportId}`);
  }

  return response.json();
}

// Fetches all reports for the logged-in user
export async function getUserReports() {
  const url = `${BACKEND_API_BASE_URL}/api/v1/interview/user`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${localStorage.getItem('token')}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user reports`);
  }

  return response.json();
}
