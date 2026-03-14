import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import DesktopOnlyRoute from "../components/DesktopOnlyRoute";

import AdminLogin from "../pages/admin/AdminLogin";
import AdminSignup from "../pages/admin/AdminSignup";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminCompanies from "../pages/admin/AdminCompanies";
import AdminCompanyCreate from "../pages/admin/AdminCompanyCreate";
import AdminCompanySetup from "../pages/admin/AdminCompanySetup";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminQuestions from "../pages/admin/AdminQuestions";
import AdminCodingProblems from "../pages/admin/AdminCodingProblems";
import AdminContests from "../pages/admin/AdminContests";

const AdminRoutes = () => {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="login" element={<AdminLogin />} />
      <Route path="signup" element={<AdminSignup />} />
      
      {/* Main Admin Layout (containing navigation tabs) */}
      <Route element={<DesktopOnlyRoute />}>
        <Route 
          path="/" 
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        >
          {/* Redirect /admin directly to /admin/dashboard */}
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          
          {/* Tab-like routes (Supports /admin/users, /admin/questions etc) */}
          <Route path="dashboard" element={<AdminUsers />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="questions" element={<AdminQuestions />} />
          <Route path="companies" element={<AdminCompanies />} />
          <Route path="coding-problems" element={<AdminCodingProblems />} />
          <Route path="contests" element={<AdminContests />} />
          
          {/* Support paths WITH 'dashboard' prefix as requested in point 2 */}
          <Route path="dashboard/users" element={<AdminUsers />} />
          <Route path="dashboard/questions" element={<AdminQuestions />} />
          <Route path="dashboard/companies" element={<AdminCompanies />} />
          <Route path="dashboard/coding-problems" element={<AdminCodingProblems />} />

          {/* Action Routes */}
          <Route path="companies/create" element={<AdminCompanyCreate />} />
          <Route path="companies/:id" element={<AdminCompanySetup />} />
        </Route>
      </Route>

      {/* Final Wildcard Catch-all using ABSOLUTE path to prevent infinite recursion */}
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
};

export default AdminRoutes;
