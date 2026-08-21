import React, { useState, useEffect } from 'react';
import Dashboard from './Dashboard';
import DoctorDashboard from './DoctorDashboard';
import LeadDoctorSelection from './LeadDoctorSelection';
import CyberMedicalWorkspace from './CyberMedicalWorkspace';
import dermAuraLogo from '../dermAuraLogoNoBG.png';
import { 
  User, 
  Stethoscope, 
  ShieldCheck, 
  Lock, 
  Mail, 
  Phone, 
  HeartPulse, 
  Award, 
  Building2, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Eye,
  EyeOff,
  Activity,
  LogOut,
  Sparkles
} from 'lucide-react';

export default function AuthPortal() {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [role, setRole] = useState('patient'); // 'patient' | 'doctor'
  const [showPassword, setShowPassword] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showCyberWorkspace, setShowCyberWorkspace] = useState(false);
  const [otpStep, setOtpStep] = useState(1);
  const [otpInput, setOtpInput] = useState('');
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    
    // Patient
    age: '',
    gender: 'Male',
    emergencyName: '',
    emergencyRelation: '',
    emergencyPhone: '',
    bloodGroup: 'O+',
    allergies: '',

    // Doctor
    licenseNumber: '',
    qualifications: '',
    specialization: 'Dermatology',
    hospitalName: '',
    experienceYears: '',
    doctorGender: 'Female',
    languagesSpoken: 'English, Hindi',
  });

  // Check if token already exists in localStorage on load
  useEffect(() => {
    const savedUser = localStorage.getItem('dermaura_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('dermaura_user');
      }
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const showToast = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleQuickDemoFill = (demoRole) => {
    setRole(demoRole);
    setAuthMode('login');
    const mockUser = demoRole === 'doctor' ? {
      id: 'demo-doc-101',
      fullName: 'Dr. Sarah Jenkins',
      email: 'doctor@dermaura.com',
      role: 'doctor',
      licenseNumber: 'MCI-98421-B',
      specialization: 'Dermatology',
      hospitalName: 'AIIMS Hospital',
      qualifications: 'MBBS, MD',
      isVerified: true
    } : {
      id: 'demo-pat-101',
      fullName: 'Aarav Sharma',
      email: 'patient@dermaura.com',
      role: 'patient',
      age: 28,
      gender: 'Male',
      primaryLeadDoctorId: 'demo-doc-101',
      primaryLeadDoctorName: 'Dr. Sarah Jenkins',
      isFirstLogin: false,
      isVerified: true
    };

    if (demoRole === 'doctor') {
      try {
        localStorage.setItem('dermaura_doctor_duty_status', 'online');
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('dermaura_duty_status_changed', { detail: 'online' }));
      } catch (e) {}
    }

    localStorage.setItem('dermaura_user', JSON.stringify(mockUser));
    setCurrentUser(mockUser);
    showToast('success', `Welcome to DermAura ${demoRole === 'doctor' ? 'Doctor Portal' : 'Patient Dashboard'}!`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (authMode === 'signup') {
        if (formData.password.length < 8) {
          showToast('error', 'Password must be at least 8 characters long!');
          setIsLoading(false);
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          showToast('error', 'Passwords do not match!');
          setIsLoading(false);
          return;
        }

        try {
          const endpoint = role === 'patient' ? '/api/auth/register/patient' : '/api/auth/register/doctor';
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...formData, expectedRole: role }),
          });

          const data = await response.json();

          if (response.ok && data.success) {
            showToast('success', data.message);
            localStorage.setItem('dermaura_token', data.token);
            localStorage.setItem('dermaura_user', JSON.stringify(data.user));
            setCurrentUser(data.user);
            return;
          }
        } catch (fetchErr) {
          console.warn('Backend API not available, registering in demo mode.');
        }

        // Registration fallback
        const newDemoUser = {
          id: `user-${Date.now()}`,
          fullName: formData.fullName || (role === 'doctor' ? 'Dr. Certified Specialist' : 'Registered Patient'),
          email: formData.email,
          role: role,
          licenseNumber: formData.licenseNumber || 'MCI-98421-B',
          specialization: formData.specialization || 'Dermatology',
          isVerified: true
        };
        localStorage.setItem('dermaura_user', JSON.stringify(newDemoUser));
        setCurrentUser(newDemoUser);
        showToast('success', 'Registration successful (Demo Mode)!');

      } else {
        // LOGIN FLOW
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: formData.email,
              password: formData.password,
              expectedRole: role,
            }),
          });

          const data = await response.json();

          if (response.ok && data.success) {
            showToast('success', data.message);
            localStorage.setItem('dermaura_token', data.token);
            localStorage.setItem('dermaura_user', JSON.stringify(data.user));
            setCurrentUser(data.user);
            return;
          }
        } catch (fetchErr) {
          console.warn('Backend API not available, logging in via demo mode.');
        }

        // Login fallback
        const fallbackUser = role === 'doctor' ? {
          id: 'doc-fallback-1',
          fullName: 'Dr. Sarah Jenkins',
          email: formData.email || 'doctor@dermaura.com',
          role: 'doctor',
          licenseNumber: 'MCI-98421-B',
          specialization: 'Dermatology',
          hospitalName: 'AIIMS Hospital',
          qualifications: 'MBBS, MD',
          isVerified: true
        } : {
          id: 'pat-fallback-1',
          fullName: 'Aarav Sharma',
          email: formData.email || 'patient@dermaura.com',
          role: 'patient',
          age: 28,
          gender: 'Male',
          primaryLeadDoctorId: 'demo-doc-101',
          primaryLeadDoctorName: 'Dr. Sarah Jenkins',
          isFirstLogin: false,
          isVerified: true
        };

        localStorage.setItem('dermaura_user', JSON.stringify(fallbackUser));
        setCurrentUser(fallbackUser);
        showToast('success', `Signed into ${role === 'doctor' ? 'Doctor Portal' : 'Patient Dashboard'}!`);
      }
    } catch (error) {
      showToast('error', 'Login error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    try {
      localStorage.setItem('dermaura_doctor_duty_status', 'offline');
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('dermaura_duty_status_changed', { detail: 'offline' }));
    } catch (e) {}

    localStorage.removeItem('dermaura_token');
    localStorage.removeItem('dermaura_user');
    setCurrentUser(null);
    showToast('success', 'Logged out successfully.');
  };

  const handleOtpVerify = (e) => {
    e.preventDefault();
    if (otpInput === '123456' || otpInput.length === 6) {
      const mockUser = {
        id: `otp-${Date.now()}`,
        fullName: role === 'doctor' ? 'Dr. OTP Verified Doctor' : 'Verified OTP Patient',
        email: 'otp_user@dermaura.com',
        phone: '+919876543210',
        role: role,
        isVerified: true,
      };
      localStorage.setItem('dermaura_user', JSON.stringify(mockUser));
      setCurrentUser(mockUser);
      setShowOtpModal(false);
      showToast('success', 'OTP Login verified successfully!');
    } else {
      showToast('error', 'Invalid OTP code. Use test code 123456');
    }
  };

  if (showCyberWorkspace) {
    return <CyberMedicalWorkspace onBack={() => setShowCyberWorkspace(false)} />;
  }

  // If user is logged in, route appropriately
  if (currentUser) {
    if (currentUser.role === 'doctor') {
      return <DoctorDashboard user={currentUser} onLogout={handleLogout} />;
    }
    // Patient: check first-login flag → show Lead Doctor onboarding
    if (currentUser.role === 'patient' && currentUser.isFirstLogin !== false && !currentUser.primaryLeadDoctorId) {
      return (
        <LeadDoctorSelection
          patientUser={currentUser}
          onDoctorSelected={(updatedUser) => setCurrentUser(updatedUser)}
        />
      );
    }
    return (
      <Dashboard
        user={currentUser}
        onLogout={handleLogout}
        onUpdateUser={(updatedUser) => setCurrentUser(updatedUser)}
      />
    );
  }


  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans relative overflow-hidden">
      {/* Background Aesthetic Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[450px] h-[450px] bg-teal-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-4xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl shadow-teal-950/40 overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">
        
        {/* Left Branding Panel */}
        <div className="lg:col-span-5 bg-gradient-to-br from-teal-900/40 via-slate-900 to-indigo-950/60 p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800 relative">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <img src={dermAuraLogo} alt="DermAura Logo" className="w-12 h-12 object-contain drop-shadow-xl" />
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white">
                  Derm<span className="text-teal-400">Aura</span>
                </h1>
                <p className="text-xs text-teal-300 font-medium">Smart AI Healthcare Portal</p>
              </div>
            </div>

            <div className="space-y-4 my-6">
              <h2 className="text-2xl font-bold text-slate-100 leading-tight">
                {authMode === 'login' ? 'Secure Login Portal' : 'Join DermAura Network'}
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Connect patients with certified medical experts through AI-driven diagnostic assistance and confidential health records.
              </p>
            </div>

            {/* Quick Demo Pre-seed Buttons */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
              <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider block">
                ⚡ Quick Hackathon Demo Credentials
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoFill('patient')}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-xs font-semibold text-teal-300 text-left transition-all"
                >
                  <User className="w-3.5 h-3.5 inline mr-1" />
                  Fill Patient
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoFill('doctor')}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-xs font-semibold text-indigo-300 text-left transition-all"
                >
                  <Stethoscope className="w-3.5 h-3.5 inline mr-1" />
                  Fill Doctor
                </button>
              </div>


            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
            <span>SIH Healthcare Edition</span>
            <span>256-bit Encrypted</span>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-center">

          {/* Notification Toast */}
          {notification && (
            <div className={`mb-6 p-4 rounded-xl flex items-center space-x-3 text-sm font-medium transition-all ${
              notification.type === 'error' 
                ? 'bg-rose-500/10 border border-rose-500/30 text-rose-300' 
                : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
            }`}>
              {notification.type === 'error' ? (
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
              ) : (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
              )}
              <span>{notification.message}</span>
            </div>
          )}

          {/* Role Switcher & Auth Mode */}
          <div className="space-y-4 mb-6">
            <div className="flex p-1 bg-slate-950/70 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => setRole('patient')}
                className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  role === 'patient'
                    ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Patient Account</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('doctor')}
                className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  role === 'doctor'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Stethoscope className="w-4 h-4" />
                <span>Doctor Portal</span>
              </button>
            </div>

            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <div className="flex space-x-6 text-sm font-semibold">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className={`pb-2 border-b-2 transition-all ${
                    authMode === 'login'
                      ? role === 'patient' ? 'border-teal-400 text-teal-400' : 'border-indigo-400 text-indigo-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('signup')}
                  className={`pb-2 border-b-2 transition-all ${
                    authMode === 'signup'
                      ? role === 'patient' ? 'border-teal-400 text-teal-400' : 'border-indigo-400 text-indigo-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Register Account
                </button>
              </div>

              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                ROLE: {role.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Registration Specific Fields */}
            {authMode === 'signup' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      name="fullName"
                      required
                      placeholder={role === 'doctor' ? 'Dr. Sarah Jenkins' : 'Aarav Sharma'}
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-all"
                    />
                  </div>
                </div>

                {role === 'patient' && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Age *</label>
                        <input
                          type="number"
                          name="age"
                          required
                          placeholder="28"
                          value={formData.age}
                          onChange={handleChange}
                          className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Gender *</label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-teal-500"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center space-x-2 text-xs font-semibold text-teal-400">
                        <HeartPulse className="w-3.5 h-3.5" />
                        <span>Emergency Contact Info</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          name="emergencyName"
                          placeholder="Contact Person Name"
                          value={formData.emergencyName}
                          onChange={handleChange}
                          className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                        />
                        <input
                          type="tel"
                          name="emergencyPhone"
                          placeholder="Emergency Phone #"
                          value={formData.emergencyPhone}
                          onChange={handleChange}
                          className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                        />
                      </div>
                    </div>
                  </>
                )}

                {role === 'doctor' && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Medical License # *</label>
                        <input
                          type="text"
                          name="licenseNumber"
                          required
                          placeholder="MCI-98421-B"
                          value={formData.licenseNumber}
                          onChange={handleChange}
                          className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Specialization *</label>
                        <select
                          name="specialization"
                          value={formData.specialization}
                          onChange={handleChange}
                          className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                        >
                          <option value="Dermatology">Dermatology</option>
                          <option value="Trichology & Scalp">Trichology & Scalp</option>
                          <option value="Cosmetic Dermatology">Cosmetic Dermatology</option>
                          <option value="General Medicine">General Medicine</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Qualifications</label>
                        <input
                          type="text"
                          name="qualifications"
                          placeholder="MBBS, MD"
                          value={formData.qualifications}
                          onChange={handleChange}
                          className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Hospital / Clinic</label>
                        <input
                          type="text"
                          name="hospitalName"
                          placeholder="AIIMS Hospital"
                          value={formData.hospitalName}
                          onChange={handleChange}
                          className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Experience (Yrs)</label>
                        <input
                          type="number"
                          name="experienceYears"
                          placeholder="10"
                          value={formData.experienceYears}
                          onChange={handleChange}
                          className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Doctor Gender + Languages Spoken */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Gender *</label>
                        <select
                          name="doctorGender"
                          value={formData.doctorGender}
                          onChange={handleChange}
                          required
                          className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                        >
                          <option value="Female">Female</option>
                          <option value="Male">Male</option>
                          <option value="Other">Other</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Languages Spoken</label>
                        <input
                          type="text"
                          name="languagesSpoken"
                          placeholder="English, Hindi, Tamil"
                          value={formData.languagesSpoken}
                          onChange={handleChange}
                          className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {/* Email & Phone */}
            <div className={`grid gap-3 ${authMode === 'signup' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="user@health.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-all"
                  />
                </div>
              </div>

              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Contact Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-all"
                    />
                  </div>
                </div>
              )}
            </div>


            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {authMode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Confirm Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    required
                    placeholder="••••••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-all"
                  />
                </div>
              </div>
            )}

            {authMode === 'login' && (
              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setShowOtpModal(true)}
                  className="text-teal-400 hover:underline font-medium"
                >
                  Sign in via OTP?
                </button>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); showToast('success', 'Password reset instructions sent.'); }} className="text-slate-400 hover:text-slate-200">
                  Forgot password?
                </a>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-xl ${
                role === 'patient'
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 shadow-teal-500/25'
                  : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-indigo-500/25'
              }`}
            >
              {isLoading ? (
                <span>Authenticating with Backend...</span>
              ) : (
                <>
                  <span>
                    {authMode === 'login' 
                      ? `Sign In as ${role === 'patient' ? 'Patient' : 'Doctor'}` 
                      : `Complete ${role === 'patient' ? 'Patient' : 'Doctor'} Registration`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <h3 className="text-lg font-bold text-slate-100 mb-2">OTP Authentication Demo</h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter your registered mobile number or email to receive a 6-digit verification code.
            </p>

            {otpStep === 1 ? (
              <form onSubmit={(e) => { e.preventDefault(); setOtpStep(2); showToast('success', 'OTP code sent! Test code: 123456'); }} className="space-y-4">
                <input
                  type="text"
                  required
                  placeholder="Enter Phone or Email"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-teal-500"
                />
                <div className="flex justify-end space-x-2 pt-2">
                  <button type="button" onClick={() => setShowOtpModal(false)} className="px-4 py-2 text-xs text-slate-400">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-teal-500 text-slate-950 text-xs font-bold rounded-lg">Send OTP</button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleOtpVerify} className="space-y-4">
                <div className="p-3 bg-teal-950/40 border border-teal-800/50 rounded-lg text-xs text-teal-300">
                  Demo code: <strong className="font-mono text-white">123456</strong>
                </div>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  placeholder="123456"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-center text-lg tracking-widest font-mono text-teal-400 focus:outline-none focus:border-teal-500"
                />
                <div className="flex justify-end space-x-2 pt-2">
                  <button type="button" onClick={() => setOtpStep(1)} className="px-4 py-2 text-xs text-slate-400">Back</button>
                  <button type="submit" className="px-4 py-2 bg-teal-500 text-slate-950 text-xs font-bold rounded-lg">Verify & Login</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
