import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children = null, allowedRoles = undefined }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If specific roles are required, check against the user's role
  if (allowedRoles && user) {
    if (!allowedRoles.includes(user.userType)) {
      console.warn("Access denied. User role:", user.userType, "Allowed:", allowedRoles);
      return <Navigate to="/forbidden" replace />;
    }
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
