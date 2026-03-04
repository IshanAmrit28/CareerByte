import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = undefined }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect them to the login page, but save the current location they were trying to go to Let's keep it simple for now and redirect to /login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If specific roles are required, check against the user's role
  if (allowedRoles && user) {
    if (!allowedRoles.includes(user.userType)) {
      console.warn("Access denied. User role:", user.userType, "Allowed:", allowedRoles);
      // Role not authorized - redirect to a safe page like home/dashboard
      // Or if they are a super admin trying to hit user routes, maybe redirect to admin dash
      if (user.userType === "admin") {
         return <Navigate to="/admin/dashboard" replace />;
      }
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
