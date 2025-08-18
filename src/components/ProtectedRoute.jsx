
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children }) {
  const { user, ready } = useAuth();


  if (!ready) return null; // or a small loader

  
  if (!user) return <Navigate to="/login" replace />;


  return children ? children : <Outlet />;
}