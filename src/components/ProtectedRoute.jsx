import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, ready } = useAuth();
  if (!ready) return <div style={{ padding: 16 }}>Loading…</div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}
