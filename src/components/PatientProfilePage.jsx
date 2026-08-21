import React, { useState, useEffect } from 'react';
import {
  User,
  ShieldCheck,
  Bell,
  Clock,
  Video,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  HeartPulse,
  Mail,
  Phone,
  MapPin,
  Edit,
  Save,
  X,
  Crown,
  Sparkles,
  Droplet,
  Scissors,
  Pill,
  Lock,
  Unlock,
  ChevronRight,
  ShoppingBag,
  Activity,
  Check,
  LogOut
} from 'lucide-react';

export default function PatientProfilePage({
  user = {},
  onUpdateUser = () => {},
  onLogout = () => {},
  onNavigateToChat = () => {},
  onNavigateToSwitchDoctor = () => {}
}) {
  const [activeSubTab, setActiveSubTab] = useState('notifications'); // 'notifications' | 'health-profile' | 'reminders'
  const [isEditing, setIsEditing] = useState(false);

  // Editable Profile Form State
  const [formData, setFormData] = useState({
    fullName: user.fullName || 'Aarav Sharma',
    email: user.email || 'aarav.sharma@example.com',
    phone: user.phone || '+91 98765 43210',
    age: user.age || 28,
    gender: user.gender || 'Male',
    bloodGroup: user.bloodGroup || 'O+',
    address: user.address || '42 Green Park Extension, New Delhi, India',
    emergencyContact: user.emergencyContact || '+91 98111 22334 (Spouse)',
    skinType: user.skinType || 'Oily / Combination',
    scalpType: user.scalpType || 'Oily Scalp with Hair Thinning',
    primaryConcern: user.primaryConcern || 'Facial Acne & Hair Loss',
    allergies: user.allergies || 'Penicillin, Sulfa Drugs',
    activeMeds: user.activeMeds || 'Salicylic Acid 2% Cleanser, Gentle Facial Moisturizer'
  });

  // Synced session requests & notifications from localStorage
  const [sessionRequests, setSessionRequests] = useState(() => {
    try {
      const saved = localStorage.getItem('dermaura_session_requests');
      return saved ? JSON.parse(saved) : [
        {
          id: 'demo-req-101',
          skinType: 'Both (Skin + Hair)',
          chiefComplaint: 'Severe Facial Acne & Scalp Hair Thinning',
          status: 'REQUESTED',
          requestedAt: '10:30 AM',
          amountPaid: 300
        }
      ];
    } catch (e) {
      return [];
    }
  });

  const [unlockedProducts, setUnlockedProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('dermaura_unlocked_products');
      return saved ? JSON.parse(saved) : ['p3', 'p4'];
    } catch (e) {
      return ['p3', 'p4'];
    }
  });

  useEffect(() => {
    const syncData = () => {
      try {
        const savedReqs = localStorage.getItem('dermaura_session_requests');
        if (savedReqs) setSessionRequests(JSON.parse(savedReqs));

        const savedUnlocks = localStorage.getItem('dermaura_unlocked_products');
        if (savedUnlocks) setUnlockedProducts(JSON.parse(savedUnlocks));
      } catch (e) {}
    };

    window.addEventListener('storage', syncData);
    const interval = setInterval(syncData, 1000);
    return () => {
      window.removeEventListener('storage', syncData);
      clearInterval(interval);
    };
  }, []);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    onUpdateUser(formData);
    try {
      const stored = JSON.parse(localStorage.getItem('dermaura_user') || '{}');
      localStorage.setItem('dermaura_user', JSON.stringify({ ...stored, ...formData }));
    } catch (err) {}
    setIsEditing(false);
  };

  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem('dermaura_user') || '{}'); } catch { return {}; }
  })();
  const resolvedUser = { ...storedUser, ...user };
  const leadDoctorName = resolvedUser.primaryLeadDoctorName || user.primaryLeadDoctorName || 'Dr. Sarah Jenkins';

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in">
      
      {/* PAGE HEADER BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-indigo-900/60 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className="w-20 h-20 rounded-3xl bg-slate-950 border-2 border-indigo-500/50 flex items-center justify-center text-4xl shadow-xl relative">
              👨‍💼
              <span className="w-4.5 h-4.5 rounded-full bg-emerald-400 border-2 border-slate-950 absolute -bottom-1 -right-1" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-black text-white">{formData.fullName}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center space-x-1">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>DermAura Verified Patient</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-2">
                <span className="flex items-center space-x-1">
                  <Mail className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{formData.email}</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <Phone className="w-3.5 h-3.5 text-teal-400" />
                  <span>{formData.phone}</span>
                </span>
                <span>•</span>
                <span className="font-mono text-emerald-400 font-bold">Age: {formData.age} Yrs ({formData.gender})</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold rounded-2xl flex items-center space-x-2 transition-all shadow cursor-pointer"
            >
              <Edit className="w-4 h-4 text-amber-400" />
              <span>{isEditing ? 'Cancel Edit' : 'Edit Profile Webpage'}</span>
            </button>

            {onLogout && (
              <button
                onClick={onLogout}
                className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold rounded-2xl flex items-center space-x-2 transition-all shadow cursor-pointer"
                title="Log Out of Patient Account"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                <span>Log Out</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* QUICK STATUS SUMMARY BAR */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1 shadow-lg">
          <span className="text-slate-500 font-mono uppercase text-[10px] font-bold">Session Alerts</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-amber-400">{sessionRequests.length}</span>
            <Bell className="w-5 h-5 text-amber-400/60" />
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1 shadow-lg">
          <span className="text-slate-500 font-mono uppercase text-[10px] font-bold">Unlocked Rx Items</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-emerald-400">{unlockedProducts.length}</span>
            <Unlock className="w-5 h-5 text-emerald-400/60" />
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1 shadow-lg">
          <span className="text-slate-500 font-mono uppercase text-[10px] font-bold">Clinical Care Team</span>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-300 truncate">3 Domain Leads</span>
            <Stethoscope className="w-5 h-5 text-teal-400/60" />
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1 shadow-lg">
          <span className="text-slate-500 font-mono uppercase text-[10px] font-bold">Skin & Scalp Type</span>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-300 truncate">{formData.skinType}</span>
            <Activity className="w-5 h-5 text-indigo-400/60" />
          </div>
        </div>
      </div>

      {/* CATEGORY LEAD DOCTORS GRID */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 md:p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center space-x-2">
              <Stethoscope className="w-4 h-4 text-teal-400" />
              <span>Assigned Category Lead Doctors (Multi-Specialist Team)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Dedicated clinical gatekeepers for each of your treatment domains.
            </p>
          </div>
          <button
            onClick={onNavigateToSwitchDoctor}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 rounded-xl text-xs font-semibold self-start sm:self-auto transition-all cursor-pointer"
          >
            Manage / Switch Doctors 🔄
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* 1. Skin Care Lead */}
          <div className="p-4 bg-slate-950/80 border border-teal-500/30 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/15 text-teal-300 border border-teal-500/30">
                ✨ Skin Care Lead
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">● Active</span>
            </div>
            <div className="flex items-center space-x-3 pt-1">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xl flex-shrink-0">
                👩‍⚕️
              </div>
              <div className="truncate">
                <h4 className="text-xs font-bold text-white truncate">
                  {resolvedUser.leadDoctors?.find(l => l.category === 'SKIN_CARE')?.doctorName || 'Dr. Sarah Jenkins, MD'}
                </h4>
                <p className="text-[10px] text-teal-400 font-mono truncate">AIIMS Hospital • Facial Acne & Barrier</p>
              </div>
            </div>
          </div>

          {/* 2. Hair Care Lead */}
          <div className="p-4 bg-slate-950/80 border border-indigo-500/30 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                💇 Hair Care Lead
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">● Active</span>
            </div>
            <div className="flex items-center space-x-3 pt-1">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xl flex-shrink-0">
                👩‍⚕️
              </div>
              <div className="truncate">
                <h4 className="text-xs font-bold text-white truncate">
                  {resolvedUser.leadDoctors?.find(l => l.category === 'HAIR_CARE')?.doctorName || 'Dr. Priya Menon, MD'}
                </h4>
                <p className="text-[10px] text-indigo-400 font-mono truncate">AIIMS New Delhi • Trichology & Scalp</p>
              </div>
            </div>
          </div>

          {/* 3. General Health Lead */}
          <div className="p-4 bg-slate-950/80 border border-amber-500/30 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                🩺 General Health Gatekeeper
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">● Active</span>
            </div>
            <div className="flex items-center space-x-3 pt-1">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xl flex-shrink-0">
                👨‍⚕️
              </div>
              <div className="truncate">
                <h4 className="text-xs font-bold text-white truncate">
                  {resolvedUser.leadDoctors?.find(l => l.category === 'GENERAL_HEALTH')?.doctorName || 'Dr. Rajesh Kumar, MBBS'}
                </h4>
                <p className="text-[10px] text-amber-400 font-mono truncate">Apollo Hospitals • Drug Safety & Vitals</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab('notifications')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center space-x-2 transition-all ${
            activeSubTab === 'notifications'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Bell className="w-4 h-4 text-amber-400" />
          <span>Notifications & Session Alerts Center</span>
          {sessionRequests.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black">
              {sessionRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('health-profile')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center space-x-2 transition-all ${
            activeSubTab === 'health-profile'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <User className="w-4 h-4 text-teal-400" />
          <span>Patient Medical Profile & Baseline</span>
        </button>
      </div>

      {/* EDIT PROFILE FORM MODAL / PANEL */}
      {isEditing && (
        <form onSubmit={handleSaveProfile} className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 space-y-4 shadow-2xl animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Edit className="w-4 h-4 text-amber-400" />
              <span>Update Patient Profile Webpage Information</span>
            </h3>
            <button type="button" onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Full Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Age</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Blood Group</label>
              <input
                type="text"
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Skin Type</label>
              <input
                type="text"
                value={formData.skinType}
                onChange={(e) => setFormData({ ...formData, skinType: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-indigo-500"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-slate-400 mb-1 font-semibold">Known Allergies</label>
              <input
                type="text"
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile Changes</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB CONTENT 1: NOTIFICATIONS & SESSION REQUESTS CENTER */}
      {activeSubTab === 'notifications' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Bell className="w-5 h-5 text-amber-400" />
                  <span>24-Hour Assessment & Tele-Consult Notifications</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Track requested 24-hr sessions, doctor acceptance status, and join video meets.
                </p>
              </div>

              <span className="px-3 py-1 bg-amber-950 text-amber-300 border border-amber-800 text-xs font-mono font-bold rounded-full">
                {sessionRequests.length} Active Alerts
              </span>
            </div>

            {sessionRequests.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto opacity-70" />
                <h4 className="text-sm font-bold text-white">No Pending Consultation Notifications</h4>
                <p className="text-xs text-slate-400">All session requests and doctor meets have been processed.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sessionRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-5 bg-slate-950/90 border border-slate-800 hover:border-indigo-500/40 rounded-2xl space-y-4 transition-all shadow-md"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-xl flex-shrink-0">
                          🩺
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-bold text-white">24-Hour Assessment Request</h4>
                            <span className="text-xs text-emerald-400 font-mono font-bold">₹{req.amountPaid || 300} Fee</span>
                          </div>
                          <span className="text-xs text-slate-400">
                            Submitted to Lead PCP: <strong className="text-slate-200">{leadDoctorName}</strong>
                          </span>
                        </div>
                      </div>

                      <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
                        req.status === 'ACCEPTED'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                      }`}>
                        {req.status === 'ACCEPTED' ? '🟢 DOCTOR ACCEPTED & MEET READY' : '⏳ PENDING DOCTOR ACCEPTANCE'}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs space-y-1">
                      <p className="text-slate-300">
                        <strong className="text-slate-400">Assessment Scope: </strong>
                        <span className="text-teal-300 font-bold">{req.skinType || 'Facial Skin + Hair'}</span>
                      </p>
                      <p className="text-slate-400">
                        <strong className="text-slate-400">Chief Concern: </strong>
                        {req.chiefComplaint}
                      </p>
                    </div>

                    <div className="pt-1 flex items-center justify-between">
                      {req.status === 'ACCEPTED' ? (
                        <button
                          onClick={onNavigateToChat}
                          className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-all"
                        >
                          <Video className="w-4 h-4" />
                          <span>Join Meet & Start Live Tele-Consultation 📹</span>
                        </button>
                      ) : (
                        <div className="w-full p-3 bg-amber-950/30 border border-amber-900/50 rounded-xl text-xs text-amber-300 flex items-center justify-between">
                          <span className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                            <span>Sitting in Notifications: Waiting for Doctor to accept request...</span>
                          </span>
                          <button
                            onClick={onNavigateToChat}
                            className="px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold rounded-lg"
                          >
                            Open Chatroom
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* DERMPHARMACY UNLOCKED PRODUCTS NOTIFICATIONS */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Unlock className="w-4.5 h-4.5 text-indigo-400" />
              <span>DermPharmacy Clinical Unlock Status</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Tretinoin 0.05% Acne Gel</span>
                  <span className="text-[11px] text-slate-400">Prescription Retinoid Product</span>
                </div>
                {unlockedProducts.includes('p6') ? (
                  <span className="px-2.5 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full font-mono text-[10px] font-bold">
                    Unlocked 🔓
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-amber-950 text-amber-300 border border-amber-800 rounded-full font-mono text-[10px] font-bold">
                    Requires Doctor Unlock 🔒
                  </span>
                )}
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Minoxidil 5% Scalp Solution</span>
                  <span className="text-[11px] text-slate-400">Gated Hair Regrowth Item</span>
                </div>
                {unlockedProducts.includes('p7') ? (
                  <span className="px-2.5 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full font-mono text-[10px] font-bold">
                    Unlocked 🔓
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-amber-950 text-amber-300 border border-amber-800 rounded-full font-mono text-[10px] font-bold">
                    Requires Doctor Unlock 🔒
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: MEDICAL PROFILE & HEALTH RECORDS */}
      {activeSubTab === 'health-profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Health Record Card */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <HeartPulse className="w-5 h-5 text-rose-400" />
                <span>Clinical Profile & Dermatological Baseline</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-slate-500 font-mono text-[10px] uppercase">Skin Classification</span>
                  <p className="font-bold text-teal-300 text-sm">{formData.skinType}</p>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-slate-500 font-mono text-[10px] uppercase">Hair & Scalp Type</span>
                  <p className="font-bold text-indigo-300 text-sm">{formData.scalpType}</p>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1 sm:col-span-2">
                  <span className="text-slate-500 font-mono text-[10px] uppercase">Primary Chief Concern</span>
                  <p className="font-bold text-white">{formData.primaryConcern}</p>
                </div>
              </div>
            </div>

            {/* Allergies & Active Medications */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Pill className="w-5 h-5 text-amber-400" />
                <span>Allergies & Current Daily Regimen</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-4 bg-rose-950/30 border border-rose-900/50 rounded-2xl space-y-1">
                  <span className="text-rose-400 font-bold text-[11px] uppercase block">Recorded Drug Allergies:</span>
                  <p className="text-rose-200 font-semibold">{formData.allergies}</p>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
                  <span className="text-slate-400 font-bold text-[11px] uppercase block">Active Medications & Skincare:</span>
                  <p className="text-slate-200">{formData.activeMeds}</p>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: LEAD PCP CARD */}
          <div className="space-y-6">
            <div className="p-6 bg-slate-900 border border-indigo-900/60 rounded-3xl space-y-4 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="inline-flex items-center space-x-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 px-3 py-1 rounded-full text-xs font-semibold">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>Assigned Lead PCP</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">🟢 Active Gatekeeper</span>
              </div>

              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-3xl mx-auto">
                  👩‍⚕️
                </div>
                <h4 className="text-base font-bold text-white">{leadDoctorName}</h4>
                <p className="text-xs text-indigo-300">Chief Primary Care Physician & Gatekeeper</p>
                <p className="text-[11px] text-slate-400 font-mono">AIIMS New Delhi • MCI-98421-B</p>
              </div>

              <div className="pt-2">
                <button
                  onClick={onNavigateToSwitchDoctor}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center space-x-1.5 transition-all"
                >
                  <Stethoscope className="w-4 h-4" />
                  <span>View PCP Safety Portal</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
