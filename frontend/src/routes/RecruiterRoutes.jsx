import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";

import Companies from "../pages/recruiter/Companies";
import CompanyCreate from "../pages/recruiter/CompanyCreate";
import CompanySetup from "../pages/recruiter/CompanySetup";
import AdminJobs from "../pages/recruiter/RecruiterJobs";
import PostJob from "../pages/recruiter/PostJob";
import Applicants from "../pages/recruiter/Applicants";

const RecruiterRoutes = () => {
  return (
    <Routes>
      <Route path="companies" element={<ProtectedRoute allowedRoles={["recruiter"]}><Companies /></ProtectedRoute>} />
      <Route path="companies/create" element={<ProtectedRoute allowedRoles={["recruiter"]}><CompanyCreate /></ProtectedRoute>} />
      <Route path="companies/:id" element={<ProtectedRoute allowedRoles={["recruiter"]}><CompanySetup /></ProtectedRoute>} />
      <Route path="jobs" element={<ProtectedRoute allowedRoles={["recruiter"]}><AdminJobs /></ProtectedRoute>} />
      <Route path="jobs/create" element={<ProtectedRoute allowedRoles={["recruiter"]}><PostJob /></ProtectedRoute>} />
      <Route path="jobs/:id/applicants" element={<ProtectedRoute allowedRoles={["recruiter"]}><Applicants /></ProtectedRoute>} />
    </Routes>
  );
};

export default RecruiterRoutes;
