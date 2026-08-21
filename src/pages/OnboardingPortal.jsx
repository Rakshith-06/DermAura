import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LeadDoctorSelection from '../components/LeadDoctorSelection';

export default function OnboardingPortal() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  return (
    <LeadDoctorSelection
      patientUser={user}
      onDoctorSelected={(updatedUser) => {
        updateUser(updatedUser);
        navigate('/patient/dashboard', { replace: true });
      }}
    />
  );
}
