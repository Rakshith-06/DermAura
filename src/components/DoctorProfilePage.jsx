import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Award,
  ShieldCheck,
  Bell,
  Clock,
  Video,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Phone,
  Building2,
  Edit,
  Save,
  X,
  Unlock,
  Lock,
  Scan,
  Activity,
  User,
  LogOut,
  Sparkles,
  DollarSign,
  FileText,
  MessageSquare,
  Check
} from 'lucide-react';

export default function DoctorProfilePage({
  user = {},
  onUpdateUser = () => {},
  onLogout = () => {},
  sessionRequests = [],
  unlockRequests = [],
  aiScans = [],
  onAcceptSession = () => {},
  onUnlockProduct = () => {},
  onLockProduct = () => {},
  onApproveScan = () => {}
}) {
  const [activeSubTab, setActiveSubTab] = useState('notifications'); // 'notifications' | 'credentials'
  const [isEditing, setIsEditing] = useState(false);

  // Editable Doctor Profile Data
  const [doctorData, setDoctorData] = useState({
    fullName: user.fullName || 'Dr. Sarah Jenkins',
    email: user.email || 'doctor@dermaura.com',
    phone: user.phone || '+91 98222 11000',
    licenseNumber: user.licenseNumber || 'MCI-98421-B',
    specialization: user.specialization || 'Facial & Scalp Dermatology',
    qualifications: user.qualifications || 'MBBS, MD Dermatology (AIIMS New Delhi)',
    hospitalName: user.hospitalName || 'AIIMS Hospital & DermAura Board',
    experienceYears: user.experienceYears || 14,
    consultationFee: user.consultationFee || 300,
    dutyStatus: user.dutyStatus || 'online',
    languagesSpoken: user.languagesSpoken || 'English, Hindi, Punjabi',
    bio: user.bio || 'Board-certified Dermatologist with 14+ years specializing in facial acne vulgaris, rosacea, alopecia, and scalp seborrheic dermatitis. Lead Primary Care Gatekeeper for DermAura SIH Network.'
  });

  const handleSaveProfile = (e) => {
    e.preventDefault();
    onUpdateUser(doctorData);
    try {
      const stored = JSON.parse(localStorage.getItem('dermaura_user') || '{}');
      localStorage.setItem('dermaura_user', JSON.stringify({ ...stored, ...doctorData }));
    } catch (err) {}
    setIsEditing(false);
  };

  const pendingSessions = sessionRequests.filter(r => r.status !== 'ACCEPTED');
  const acceptedSessions = sessionRequests.filter(r => r.status === 'ACCEPTED');
  const pendingUnlocks = unlockRequests.filter(r => r.status?.includes('Pending'));
  const pendingScans = aiScans.filter(s => s.status?.includes('Pending'));

  const totalAlertsCount = pendingSessions.length + pendingUnlocks.length + pendingScans.length;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      
      {/* HEADER BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 border border-emerald-700/60 p-6 md:p-8 shadow-xl text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className="w-20 h-20 rounded-3xl bg-white border-2 border-emerald-300 flex items-center justify-center text-4xl shadow-md relative">
              👩‍⚕️
              <span className="w-4.5 h-4.5 rounded-full bg-emerald-500 border-2 border-white absolute -bottom-1 -right-1 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-black text-white">{doctorData.fullName}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/20 border border-white/30 text-white flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
                  <span>Verified Tele-Dermatologist</span>
                </span>
              </div>

              <p className="text-xs text-emerald-100 font-medium mt-0.5">{doctorData.specialization}</p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-emerald-100 mt-2">
                <span className="flex items-center space-x-1 font-mono text-white font-bold">
                  <Award className="w-3.5 h-3.5 text-emerald-300" />
                  <span>License: {doctorData.licenseNumber}</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <Building2 className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{doctorData.hospitalName}</span>
                </span>
                <span>•</span>
                <span className="font-mono text-white font-bold">{doctorData.experienceYears} Yrs Exp</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2.5 bg-white hover:bg-emerald-50 text-stone-800 text-xs font-bold rounded-2xl flex items-center space-x-2 transition-all shadow-sm cursor-pointer"
            >
              <Edit className="w-4 h-4 text-emerald-700" />
              <span>{isEditing ? 'Close Form' : 'Edit Doctor Profile'}</span>
            </button>

            <button
              onClick={onLogout}
              className="px-4 py-2.5 bg-rose-600/20 hover:bg-rose-600/30 text-white border border-rose-400/40 text-xs font-bold rounded-2xl flex items-center space-x-2 transition-all shadow-sm cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-rose-200" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* QUICK STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div className="p-4 bg-white border border-stone-200 rounded-2xl space-y-1 shadow-xs">
          <span className="text-stone-500 font-mono uppercase text-[10px] font-bold">Pending 24-Hr Sessions</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-amber-700">{pendingSessions.length}</span>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
        </div>

        <div className="p-4 bg-white border border-stone-200 rounded-2xl space-y-1 shadow-xs">
          <span className="text-stone-500 font-mono uppercase text-[10px] font-bold">Active Live Meets</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-emerald-700">{acceptedSessions.length}</span>
            <Video className="w-5 h-5 text-emerald-600" />
          </div>
        </div>

        <div className="p-4 bg-white border border-stone-200 rounded-2xl space-y-1 shadow-xs">
          <span className="text-stone-500 font-mono uppercase text-[10px] font-bold">Rx Unlock Requests</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-emerald-700">{pendingUnlocks.length}</span>
            <Unlock className="w-5 h-5 text-emerald-600" />
          </div>
        </div>

        <div className="p-4 bg-white border border-stone-200 rounded-2xl space-y-1 shadow-xs">
          <span className="text-stone-500 font-mono uppercase text-[10px] font-bold">Pending DermScans</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-emerald-700">{pendingScans.length}</span>
            <Scan className="w-5 h-5 text-emerald-600" />
          </div>
        </div>
      </div>

      {/* SUB-TABS NAVIGATION */}
      <div className="flex items-center space-x-3 border-b border-stone-200 pb-3">
        <button
          onClick={() => setActiveSubTab('notifications')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
            activeSubTab === 'notifications'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200'
          }`}
        >
          <Bell className="w-4 h-4 text-amber-500" />
          <span>Doctor Action Hub & Notifications</span>
          {totalAlertsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black animate-pulse">
              {totalAlertsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('credentials')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
            activeSubTab === 'credentials'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200'
          }`}
        >
          <Award className="w-4 h-4 text-emerald-600" />
          <span>Full Credentials & Clinical Profile</span>
        </button>
      </div>

      {/* EDIT DOCTOR FORM */}
      {isEditing && (
        <form onSubmit={handleSaveProfile} className="bg-white border border-stone-200 rounded-3xl p-6 space-y-4 shadow-sm animate-in fade-in">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <h3 className="text-sm font-bold text-stone-900 flex items-center space-x-2">
              <Edit className="w-4 h-4 text-emerald-600" />
              <span>Update Doctor Profile & Medical Credentials</span>
            </h3>
            <button type="button" onClick={() => setIsEditing(false)} className="text-stone-400 hover:text-stone-700">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-stone-700 mb-1 font-bold">Doctor Full Name</label>
              <input
                type="text"
                value={doctorData.fullName}
                onChange={(e) => setDoctorData({ ...doctorData, fullName: e.target.value })}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-stone-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-stone-700 mb-1 font-bold">Email Address</label>
              <input
                type="email"
                value={doctorData.email}
                onChange={(e) => setDoctorData({ ...doctorData, email: e.target.value })}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-stone-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-stone-700 mb-1 font-bold">Medical License #</label>
              <input
                type="text"
                value={doctorData.licenseNumber}
                onChange={(e) => setDoctorData({ ...doctorData, licenseNumber: e.target.value })}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-stone-900 focus:outline-none focus:border-emerald-600 focus:bg-white font-mono"
              />
            </div>

            <div>
              <label className="block text-stone-700 mb-1 font-bold">Specialization</label>
              <input
                type="text"
                value={doctorData.specialization}
                onChange={(e) => setDoctorData({ ...doctorData, specialization: e.target.value })}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-stone-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-stone-700 mb-1 font-bold">Academic Qualifications</label>
              <input
                type="text"
                value={doctorData.qualifications}
                onChange={(e) => setDoctorData({ ...doctorData, qualifications: e.target.value })}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-stone-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-stone-700 mb-1 font-bold">Hospital / Clinic Affiliation</label>
              <input
                type="text"
                value={doctorData.hospitalName}
                onChange={(e) => setDoctorData({ ...doctorData, hospitalName: e.target.value })}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-stone-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-stone-700 mb-1 font-bold">Years of Experience</label>
              <input
                type="number"
                value={doctorData.experienceYears}
                onChange={(e) => setDoctorData({ ...doctorData, experienceYears: e.target.value })}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-stone-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-stone-700 mb-1 font-bold">24-Hr Consult Fee (₹)</label>
              <input
                type="number"
                value={doctorData.consultationFee}
                onChange={(e) => setDoctorData({ ...doctorData, consultationFee: e.target.value })}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-stone-900 focus:outline-none focus:border-emerald-600 focus:bg-white font-mono"
              />
            </div>

            <div>
              <label className="block text-stone-700 mb-1 font-bold">Languages Spoken</label>
              <input
                type="text"
                value={doctorData.languagesSpoken}
                onChange={(e) => setDoctorData({ ...doctorData, languagesSpoken: e.target.value })}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-stone-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-stone-700 mb-1 font-bold">Clinical Bio & Scope</label>
              <textarea
                rows={2}
                value={doctorData.bio}
                onChange={(e) => setDoctorData({ ...doctorData, bio: e.target.value })}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-stone-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Doctor Profile</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB CONTENT 1: DOCTOR ACTION HUB & NOTIFICATIONS */}
      {activeSubTab === 'notifications' && (
        <div className="space-y-6">
          
          {/* SECTION 1: 24-HOUR CONSULTATION REQUESTS FROM PATIENTS */}
          <div className="bg-white border border-stone-200 rounded-3xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-stone-900 flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-emerald-600" />
                  <span>Incoming 24-Hour Patient Assessment Requests</span>
                </h3>
                <p className="text-xs text-stone-500">
                  Review incoming requests paid by patients via escrow (₹300) and launch live tele-consultation video meetings.
                </p>
              </div>

              <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-300 text-xs font-mono font-bold rounded-full">
                {pendingSessions.length} Pending Accept
              </span>
            </div>

            {sessionRequests.length === 0 ? (
              <div className="p-8 text-center bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto opacity-70" />
                <h4 className="text-sm font-bold text-stone-900">No Pending Patient Session Requests</h4>
                <p className="text-xs text-stone-500">All consultation requests have been accepted and processed.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sessionRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-5 bg-stone-50 border border-stone-200 rounded-2xl space-y-3 hover:border-emerald-300 transition-all shadow-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-sm">
                          👨
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-stone-900">Patient Consultation Request</h4>
                          <span className="text-xs text-stone-600">
                            Requested Scope: <strong className="text-emerald-700">{req.skinType || 'Skin + Hair'}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          ₹{req.amountPaid || 300} Escrow Paid
                        </span>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                          req.status === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200 animate-pulse'
                        }`}>
                          {req.status === 'ACCEPTED' ? '🟢 ACCEPTED BY DOCTOR' : '⏳ PENDING DOCTOR ACTION'}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-stone-700 bg-white p-3 rounded-xl border border-stone-200">
                      <strong className="text-stone-900 font-bold">Chief Complaint: </strong>
                      {req.chiefComplaint}
                    </p>

                    <div className="flex justify-end pt-1">
                      {req.status === 'ACCEPTED' ? (
                        <div className="px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center space-x-2">
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span>Meet Live Active in Tele-Chatroom 📹</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => onAcceptSession(req.id)}
                          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
                        >
                          <Video className="w-4 h-4" />
                          <span>Accept Request & Launch Live Meet 📹</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 2: DERMPHARMACY PRODUCT & PRESCRIPTION UNLOCK REQUESTS */}
          <div className="bg-white border border-stone-200 rounded-3xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-stone-900 flex items-center space-x-2">
                  <Unlock className="w-5 h-5 text-emerald-600" />
                  <span>DermPharmacy Prescription Item Unlock Alerts</span>
                </h3>
                <p className="text-xs text-stone-500">
                  Review prescription unlock requests for gated dermatological items (e.g., Tretinoin, Minoxidil).
                </p>
              </div>

              <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-mono font-bold rounded-full">
                {pendingUnlocks.length} Requests
              </span>
            </div>

            {unlockRequests.length === 0 ? (
              <div className="p-6 text-center bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-500">
                No active e-pharmacy unlock requests.
              </div>
            ) : (
              <div className="space-y-3">
                {unlockRequests.map((req) => (
                  <div key={req.id} className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{req.productImage || '💊'}</span>
                        <div>
                          <span className="font-bold text-stone-900 text-sm block">{req.productName}</span>
                          <span className="text-stone-500">Requested by Patient: <strong className="text-emerald-700">{req.patientName}</strong></span>
                        </div>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                        req.status?.includes('UNLOCKED') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {req.status}
                      </span>
                    </div>

                    <p className="text-stone-700 bg-white p-2.5 rounded-xl border border-stone-200">
                      "{req.message}"
                    </p>

                    <div className="flex justify-end space-x-2 pt-1">
                      {!req.status?.includes('UNLOCKED') ? (
                        <button
                          onClick={() => onUnlockProduct(req.productId, req.id)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center space-x-1.5 shadow-xs cursor-pointer"
                        >
                          <Unlock className="w-4 h-4" />
                          <span>Approve Clinical Unlock 🔓</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onLockProduct(req.productId)}
                          className="px-4 py-2 bg-stone-100 hover:bg-rose-50 text-stone-700 hover:text-rose-700 border border-stone-200 hover:border-rose-300 font-bold rounded-xl flex items-center space-x-1.5"
                        >
                          <Lock className="w-4 h-4" />
                          <span>Lock Item Again 🔒</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 3: PENDING AI DERMSCAN VERIFICATION ALERTS */}
          <div className="bg-white border border-stone-200 rounded-3xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-stone-900 flex items-center space-x-2">
                  <Scan className="w-5 h-5 text-emerald-600" />
                  <span>Pending AI DermScan Clinical Verification Alerts</span>
                </h3>
                <p className="text-xs text-stone-500">
                  Review high-confidence AI lesion detections and sign off clinical triage.
                </p>
              </div>

              <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-mono font-bold rounded-full">
                {pendingScans.length} Pending Scans
              </span>
            </div>

            {aiScans.length === 0 ? (
              <div className="p-6 text-center bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-500">
                No pending AI DermScans.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiScans.map((scan) => (
                  <div key={scan.id} className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3 text-xs">
                    <div className="flex items-center space-x-3">
                      <img src={scan.image} alt={scan.predictedCondition} className="w-14 h-14 rounded-xl object-cover border border-stone-200" />
                      <div>
                        <h4 className="font-bold text-stone-900">{scan.patientName}</h4>
                        <p className="text-emerald-700 font-bold">{scan.predictedCondition} ({scan.confidence})</p>
                        <span className="text-[10px] text-stone-500 font-mono">{scan.scanDate}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-stone-200 pt-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        scan.status.includes('Verified') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {scan.status}
                      </span>

                      {!scan.status.includes('Verified') && (
                        <button
                          onClick={() => onApproveScan(scan.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center space-x-1 shadow-xs cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Verify & Sign Off</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB CONTENT 2: FULL CREDENTIALS & CLINICAL PROFILE */}
      {activeSubTab === 'credentials' && (
        <div className="space-y-6">
          <div className="p-6 bg-white border border-stone-200 rounded-3xl space-y-6 shadow-xs">
            <h3 className="text-sm font-bold text-stone-900 flex items-center space-x-2 border-b border-stone-200 pb-3">
              <Award className="w-5 h-5 text-emerald-600" />
              <span>Official Medical Registration & Clinical Bio</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                <span className="text-stone-500 font-mono text-[10px] uppercase font-bold block">Doctor Name</span>
                <p className="font-bold text-stone-900 text-base">{doctorData.fullName}</p>
              </div>

              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                <span className="text-stone-500 font-mono text-[10px] uppercase font-bold block">Medical Council License Number</span>
                <p className="font-bold text-emerald-700 font-mono text-base">{doctorData.licenseNumber}</p>
              </div>

              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                <span className="text-stone-500 font-mono text-[10px] uppercase font-bold block">Clinical Specialization</span>
                <p className="font-bold text-emerald-800">{doctorData.specialization}</p>
              </div>

              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                <span className="text-stone-500 font-mono text-[10px] uppercase font-bold block">Academic Degrees</span>
                <p className="font-semibold text-stone-800">{doctorData.qualifications}</p>
              </div>

              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                <span className="text-stone-500 font-mono text-[10px] uppercase font-bold block">Hospital / Institution</span>
                <p className="font-semibold text-stone-800">{doctorData.hospitalName}</p>
              </div>

              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                <span className="text-stone-500 font-mono text-[10px] uppercase font-bold block">Years of Active Practice</span>
                <p className="font-bold text-emerald-700 text-sm">{doctorData.experienceYears} Years Clinical Dermatology</p>
              </div>

              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1 md:col-span-2">
                <span className="text-stone-500 font-mono text-[10px] uppercase font-bold block">Clinical Bio & Expert Overview</span>
                <p className="text-stone-700 leading-relaxed text-xs">{doctorData.bio}</p>
              </div>

              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                <span className="text-stone-500 font-mono text-[10px] uppercase font-bold block">Languages Spoken</span>
                <p className="font-bold text-stone-800">{doctorData.languagesSpoken}</p>
              </div>

              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                <span className="text-stone-500 font-mono text-[10px] uppercase font-bold block">24-Hr Assessment Rate</span>
                <p className="font-bold text-emerald-700 font-mono text-sm">₹{doctorData.consultationFee} per session (Escrow Protected)</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
