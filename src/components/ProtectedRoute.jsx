import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from './LoadingScreen';

export default function ProtectedRoute({ allowedRoles = [], children }) {
  const { user, role, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading screen while validating auth token/session from localStorage
  if (isLoading) {
    return <LoadingScreen message="Restoring clinical session..." />;
  }

  // Not logged in -> Redirect to login page and preserve attempted path in state
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const normalizedRole = (role || user.role || 'patient').toLowerCase();

  // If specific roles are required, verify access
  if (allowedRoles.length > 0) {
    const isAllowed = allowedRoles.map(r => r.toLowerCase()).includes(normalizedRole);

    if (!isAllowed) {
      // Role mismatch -> Redirect to the user's appropriate portal
      if (normalizedRole === 'doctor') {
        return <Navigate to="/doctor/dashboard" replace />;
      }
      return <Navigate to="/patient/dashboard" replace />;
    }
  }

  // First-time patient lead doctor selection check
  if (
    normalizedRole === 'patient' &&
    user.isFirstLogin &&
    location.pathname !== '/onboarding/select-doctor'
  ) {
    return <Navigate to="/onboarding/select-doctor" replace />;
  }

  return children ? children : <Outlet />;
}
