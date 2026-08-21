import React from 'react';
import { useAuth } from '../context/AuthContext';
import Dashboard from '../components/Dashboard';

export default function PatientPortal() {
  const { user, logout, updateUser } = useAuth();

  return (
    <Dashboard
      user={user}
      onLogout={logout}
      onUpdateUser={updateUser}
    />
  );
}
