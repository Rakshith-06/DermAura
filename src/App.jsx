import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPortal from './components/AuthPortal';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import LoadingScreen from './components/LoadingScreen';
import PatientPortal from './pages/PatientPortal';
import DoctorPortal from './pages/DoctorPortal';
import OnboardingPortal from './pages/OnboardingPortal';

/**
 * RootRedirect component:
 * Directs incoming traffic to the appropriate dashboard or login screen based on auth state.
 */
function RootRedirect() {
  const { user, role, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen message="Checking session state..." />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const normalizedRole = (role || user.role || 'patient').toLowerCase();
  if (normalizedRole === 'doctor') {
    return <Navigate to="/doctor/dashboard" replace />;
  }

  if (user.isFirstLogin) {
    return <Navigate to="/onboarding/select-doctor" replace />;
  }

  return <Navigate to="/patient/dashboard" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <main className="w-full min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-emerald-500 selection:text-white">
          <Routes>
            {/* Root Route */}
            <Route path="/" element={<RootRedirect />} />

            {/* Public Login Route (Blocked if already authenticated) */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <AuthPortal />
                </PublicRoute>
              }
            />

            {/* Protected Patient Routes */}
            <Route
              path="/patient"
              element={<Navigate to="/patient/dashboard" replace />}
            />
            <Route
              path="/patient/dashboard"
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <PatientPortal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/*"
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <PatientPortal />
                </ProtectedRoute>
              }
            />

            {/* Protected First-Time Patient Onboarding Route */}
            <Route
              path="/onboarding/select-doctor"
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <OnboardingPortal />
                </ProtectedRoute>
              }
            />

            {/* Protected Doctor Routes */}
            <Route
              path="/doctor"
              element={<Navigate to="/doctor/dashboard" replace />}
            />
            <Route
              path="/doctor/dashboard"
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <DoctorPortal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/*"
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <DoctorPortal />
                </ProtectedRoute>
              }
            />

            {/* Catch-all Wildcard Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </AuthProvider>
    </BrowserRouter>
  );
}
