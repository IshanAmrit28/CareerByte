import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import DesktopOnlyRoute from "../components/DesktopOnlyRoute";
import Report from "../pages/candidate/Report";

import RecruiterDashboard from "../pages/recruiter/RecruiterDashboard";
import AdminJobs from "../pages/recruiter/RecruiterJobs";
import PostJob from "../pages/recruiter/PostJob";
import Applicants from "../pages/recruiter/Applicants";

import RecruiterLogin from "../pages/recruiter/RecruiterLogin";
import RecruiterSignup from "../pages/recruiter/RecruiterSignup";
import RecruiterAssessments from "../pages/recruiter/RecruiterAssessments";
import AssessmentReports from "../pages/recruiter/AssessmentReports";
import RecruiterQuestions from "../pages/recruiter/RecruiterQuestions";

const RecruiterRoutes = () => {
  return (
    <Routes>
      <Route path="login" element={<RecruiterLogin />} />
      <Route path="signup" element={<RecruiterSignup />} />
      
      <Route element={<DesktopOnlyRoute />}>
        <Route path="dashboard" element={<ProtectedRoute allowedRoles={["recruiter"]}><RecruiterDashboard /></ProtectedRoute>} />
        <Route path="jobs" element={<ProtectedRoute allowedRoles={["recruiter"]}><AdminJobs /></ProtectedRoute>} />
        <Route path="jobs/create" element={<ProtectedRoute allowedRoles={["recruiter"]}><PostJob /></ProtectedRoute>} />
        <Route path="jobs/:id/applicants" element={<ProtectedRoute allowedRoles={["recruiter"]}><Applicants /></ProtectedRoute>} />
        <Route path="assessments" element={<ProtectedRoute allowedRoles={["recruiter"]}><RecruiterAssessments /></ProtectedRoute>} />
        <Route path="assessments/:assessmentId/reports" element={<ProtectedRoute allowedRoles={["recruiter"]}><AssessmentReports /></ProtectedRoute>} />
        <Route path="report/:reportId" element={<ProtectedRoute allowedRoles={["recruiter", "admin"]}><Report /></ProtectedRoute>} />
        <Route path="questions" element={<ProtectedRoute allowedRoles={["recruiter"]}><RecruiterQuestions /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
};

export default RecruiterRoutes;
