import React from 'react';
import { useAuth } from '../context/AuthContext';
import DoctorDashboard from '../components/DoctorDashboard';

export default function DoctorPortal() {
  const { user, logout } = useAuth();

  return (
    <DoctorDashboard
      user={user}
      doctorUser={user}
      onLogout={logout}
    />
  );
}
