import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="auth-loading-screen">
        <div className="auth-spinner" />
        <p className="auth-loading-text">Verifying session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export function PublicOnlyRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="auth-loading-screen">
        <div className="auth-spinner" />
        <p className="auth-loading-text">Loading...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    // Authenticated users visiting /login or /signup are redirected to /predict
    return <Navigate to="/predict" replace />;
  }

  return children;
}

export default ProtectedRoute;
