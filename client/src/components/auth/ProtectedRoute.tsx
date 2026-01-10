import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

type Role = "student" | "mentor" | "admin";

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    // You might want a spinner here
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to their appropriate dashboard if they try to access a route they don't have permission for
     if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
     if (user.role === 'mentor') return <Navigate to="/mentor/dashboard" replace />;
     if (user.role === 'student') return <Navigate to="/student/dashboard" replace />;
    
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
