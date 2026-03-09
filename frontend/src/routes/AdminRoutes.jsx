import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";

import AdminLogin from "../pages/admin/AdminLogin";
import AdminSignup from "../pages/admin/AdminSignup";
import AdminDashboard from "../pages/admin/AdminDashboard";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="login" element={<AdminLogin />} />
      <Route path="signup" element={<AdminSignup />} />
      <Route 
        path="dashboard" 
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};

export default AdminRoutes;
