
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children }) {
  const { user, ready } = useAuth();


  if (!ready) return null; // Wait until auth state is ready
  // If user is not authenticated, redirect to login
  
  if (!user) return <Navigate to="/login" replace />;


  return children ? children : <Outlet />;
}