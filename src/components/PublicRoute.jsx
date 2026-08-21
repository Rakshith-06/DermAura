import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from './LoadingScreen';

export default function PublicRoute({ children }) {
  const { user, role, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen message="Checking session state..." />;
  }

  // If already authenticated, redirect away from public login page to respective dashboard
  if (isAuthenticated && user) {
    const destination = location.state?.from?.pathname || (
      (role || user.role || 'patient').toLowerCase() === 'doctor'
        ? '/doctor/dashboard'
        : user.isFirstLogin
          ? '/onboarding/select-doctor'
          : '/patient/dashboard'
    );

    return <Navigate to={destination} replace />;
  }

  return children ? children : <Outlet />;
}
