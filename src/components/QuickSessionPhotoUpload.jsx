import React, { useState } from 'react';
import { API_BASE } from '../api.js';
import {
  Upload,
  Camera,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Sparkles,
  X,
  ArrowRight,
  IndianRupee,
  FileText,
  Smile,
  Scissors,
  Layers
} from 'lucide-react';

const FACIAL_SKIN_TYPES = [
  { id: 'Oily Skin', label: 'Oily Facial Skin', desc: 'Excess sebum, enlarged pores, acne papules' },
  { id: 'Dry / Flaky Skin', label: 'Dry / Flaky Skin', desc: 'Tightness, roughness, peeling, dry patches' },
  { id: 'Combination Skin', label: 'Combination Skin', desc: 'Oily T-zone (forehead/nose), dry cheeks' },
  { id: 'Sensitive Skin', label: 'Sensitive Skin', desc: 'Prone to facial redness, burning, rosacea' },
];

const HAIR_SCALP_TYPES = [
  { id: 'Scalp Flaking / Dandruff', label: 'Scalp Flaking & Dandruff', desc: 'Visible white/yellow flakes, intense itching' },
  { id: 'Hair Thinning / Shedding', label: 'Hair Thinning & Shedding', desc: 'Crown/hairline recession, telogen shedding' },
  { id: 'Oily Scalp & Follicles', label: 'Oily Scalp & Follicles', desc: 'Greasy scalp buildup, scalp folliculitis' },
  { id: 'Dry / Itchy Scalp', label: 'Dry & Itchy Scalp', desc: 'Tight scalp sensation, lack of natural oil' },
];

const PRESET_CLINICAL_PHOTOS = [
  { url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=400&q=80', label: 'Facial Rash / Acne' },
  { url: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=400&q=80', label: 'Scalp Erythema' },
  { url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80', label: 'Skin Redness' },
];

export default function QuickSessionPhotoUpload({
  patientId = 'pat-aarav-101',
  leadDoctorId = 'doc-sarah-jenkins',
  onSessionCreated = () => {},
  onCancel = () => {},
}) {
  // Real-time synced Doctor Duty Status
  const [doctorDutyStatus, setDoctorDutyStatus] = useState(() => {
    try {
      return localStorage.getItem('dermaura_doctor_duty_status') || 'online';
    } catch (e) {
      return 'online';
    }
  });

  React.useEffect(() => {
    const syncStatus = () => {
      try {
        setDoctorDutyStatus(localStorage.getItem('dermaura_doctor_duty_status') || 'online');
      } catch (e) {}
    };
    window.addEventListener('storage', syncStatus);
    window.addEventListener('dermaura_duty_status_changed', syncStatus);
    const interval = setInterval(syncStatus, 1000);
    return () => {
      window.removeEventListener('storage', syncStatus);
      window.removeEventListener('dermaura_duty_status_changed', syncStatus);
      clearInterval(interval);
    };
  }, []);

  // Concern Category: 'SKIN' | 'HAIR' | 'BOTH'
  const [concernCategory, setConcernCategory] = useState('BOTH');
  
  // Selections
  const [facialSkinType, setFacialSkinType] = useState('Oily Skin');
  const [hairScalpType, setHairScalpType] = useState('Hair Thinning / Shedding');

  const [chiefComplaint, setChiefComplaint] = useState('');
  const [photos, setPhotos] = useState([
    { url: PRESET_CLINICAL_PHOTOS[0].url, caption: 'Affected area photo' }
  ]);
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  const handleAddPhoto = (url, caption = 'Uploaded clinical image') => {
    if (!url) return;
    setPhotos((prev) => [...prev, { url, caption }]);
    setCustomPhotoUrl('');
  };

  const handleRemovePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!chiefComplaint.trim()) {
      setError('Please describe your skin/hair concern in the chief complaint field.');
      return;
    }

    // Construct unified skin/hair type description
    let combinedSkinType = '';
    if (concernCategory === 'SKIN') {
      combinedSkinType = facialSkinType;
    } else if (concernCategory === 'HAIR') {
      combinedSkinType = hairScalpType;
    } else {
      combinedSkinType = `Facial: ${facialSkinType} | Scalp: ${hairScalpType}`;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/consultations/one-time`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          leadDoctorId,
          chiefComplaint,
          skinType: combinedSkinType,
          concernCategory,
          facialSkinType: concernCategory !== 'HAIR' ? facialSkinType : null,
          hairScalpType: concernCategory !== 'SKIN' ? hairScalpType : null,
          photos,
          amountPaid: 300,
        }),
      });

      const data = await response.json();
      let createdConsult = data.consultation;
      if (!data.success || !createdConsult) {
        createdConsult = {
          id: `consult-ot-${Date.now()}`,
          patientId,
          leadDoctorId,
          assignedDoctorId: leadDoctorId,
          type: 'ONE_TIME_SUGGESTION',
          status: 'REQUESTED',
          skinType: combinedSkinType,
          concernCategory,
          chiefComplaint,
          photos,
          requestedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          financials: {
            currency: 'INR',
            symbol: '₹',
            amountPaid: 300,
            formattedAmountPaid: '₹300',
          },
        };
      }

      // Save into localStorage for real-time patient-doctor sync
      try {
        const existingReqs = JSON.parse(localStorage.getItem('dermaura_session_requests') || '[]');
        const updatedReqs = [createdConsult, ...existingReqs.filter(r => r.id !== createdConsult.id)];
        localStorage.setItem('dermaura_session_requests', JSON.stringify(updatedReqs));
      } catch (e) {}

      setSuccessData(createdConsult);
    } catch (err) {
      // Mock Fallback for Demo Mode
      const mockConsultation = {
        id: `consult-ot-${Date.now()}`,
        patientId,
        leadDoctorId,
        assignedDoctorId: leadDoctorId,
        type: 'ONE_TIME_SUGGESTION',
        status: 'REQUESTED',
        skinType: combinedSkinType,
        concernCategory,
        chiefComplaint,
        photos,
        requestedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        financials: {
          currency: 'INR',
          symbol: '₹',
          amountPaid: 300,
          formattedAmountPaid: '₹300',
        },
      };

      try {
        const existingReqs = JSON.parse(localStorage.getItem('dermaura_session_requests') || '[]');
        const updatedReqs = [mockConsultation, ...existingReqs.filter(r => r.id !== mockConsultation.id)];
        localStorage.setItem('dermaura_session_requests', JSON.stringify(updatedReqs));
      } catch (e) {}

      setSuccessData(mockConsultation);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl text-slate-100 relative overflow-hidden">
      {/* Background Decorative Blur */}
      <div className="absolute -top-20 -right-20 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-5 mb-6">
        <div>
          <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>24-Hour Instant Consultation</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Pre-Consultation Assessment</h2>
          <p className="text-slate-400 text-xs mt-0.5">Choose Facial Skin, Hair & Scalp, or Both for Lead PCP Evaluation</p>
        </div>

        <button
          onClick={onCancel}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* DOCTOR CLINICAL AVAILABILITY LIVE BANNER */}
      <div className={`mb-6 p-4 rounded-2xl border flex items-center justify-between transition-all ${
        doctorDutyStatus === 'online'
          ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200'
          : doctorDutyStatus === 'busy'
          ? 'bg-amber-950/50 border-amber-500/40 text-amber-200'
          : 'bg-rose-950/50 border-rose-500/40 text-rose-200'
      }`}>
        <div className="flex items-center space-x-3">
          <span className={`w-3.5 h-3.5 rounded-full flex-shrink-0 ${
            doctorDutyStatus === 'online' ? 'bg-emerald-400 animate-pulse' : doctorDutyStatus === 'busy' ? 'bg-amber-400' : 'bg-rose-500'
          }`} />
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-xs text-white">Lead PCP Status:</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                doctorDutyStatus === 'online'
                  ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-700'
                  : doctorDutyStatus === 'busy'
                  ? 'bg-amber-900/80 text-amber-300 border border-amber-700'
                  : 'bg-rose-900/80 text-rose-300 border border-rose-700'
              }`}>
                {doctorDutyStatus === 'online' ? '🟢 Online for Instant Review' : doctorDutyStatus === 'busy' ? '🟡 Busy in Consultation' : '🔴 Off-Duty / On Break'}
              </span>
            </div>
            <p className="text-[11px] opacity-80 mt-0.5">
              {
                doctorDutyStatus === 'online'
                  ? 'Doctor is currently logged on and ready to accept your tele-consultation request.'
                  : doctorDutyStatus === 'busy'
                  ? 'Doctor is currently in surgery/consultation — your session will enter priority queue.'
                  : 'Doctor is off-duty — your request will be queued for immediate review when doctor returns online.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* SUCCESS CONFIRMATION BANNER */}
      {successData ? (
        <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-6 text-center space-y-4 animate-in fade-in zoom-in">
          <div className="w-14 h-14 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto text-amber-400 border border-amber-500/30">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>
          <h3 className="text-xl font-bold text-white">24-Hr Assessment Requested!</h3>
          <p className="text-slate-300 text-xs max-w-md mx-auto leading-relaxed">
            Your 24-hour instant session request has been submitted to your Lead PCP (Fee <span className="font-bold text-amber-400">₹300</span>).
            <br />
            It is now sitting in your <strong className="text-white">Notifications 🔔</strong> panel. Once your Doctor accepts the request, your meeting will automatically start!
          </p>

          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs space-y-1 max-w-sm mx-auto text-left">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Assessment Scope:</span>
              <span className="font-bold text-teal-300 text-[11px]">{successData.skinType}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Status:</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
                ⏳ REQUESTED (Pending Doctor Acceptance)
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-3 pt-2">
            <button
              onClick={() => onSessionCreated(successData)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg flex items-center space-x-2 transition-all"
            >
              <span>Go to Tele-Chatroom 💬</span>
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: CONSULTATION SCOPE CATEGORY SELECTOR */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
              1. What would you like assistance with? <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setConcernCategory('SKIN')}
                className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center space-y-1.5 ${
                  concernCategory === 'SKIN'
                    ? 'bg-teal-500/20 border-teal-500 text-white shadow-lg shadow-teal-500/10'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                }`}
              >
                <Smile className="w-5 h-5 text-teal-400" />
                <span className="font-bold text-xs">Facial Skin Only</span>
                <span className="text-[9px] opacity-70">Acne, rash, oiliness</span>
              </button>

              <button
                type="button"
                onClick={() => setConcernCategory('HAIR')}
                className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center space-y-1.5 ${
                  concernCategory === 'HAIR'
                    ? 'bg-indigo-500/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                }`}
              >
                <Scissors className="w-5 h-5 text-indigo-400" />
                <span className="font-bold text-xs">Hair & Scalp Only</span>
                <span className="text-[9px] opacity-70">Hair loss, dandruff</span>
              </button>

              <button
                type="button"
                onClick={() => setConcernCategory('BOTH')}
                className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center space-y-1.5 relative overflow-hidden ${
                  concernCategory === 'BOTH'
                    ? 'bg-gradient-to-br from-teal-500/20 to-indigo-500/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-1">
                  <Smile className="w-4 h-4 text-teal-400" />
                  <span className="text-slate-400">+</span>
                  <Scissors className="w-4 h-4 text-indigo-400" />
                </div>
                <span className="font-bold text-xs text-white">Both (Skin + Hair)</span>
                <span className="text-[9px] text-amber-400 font-medium">Combined Care</span>
              </button>
            </div>
          </div>

          {/* STEP 2: DYNAMIC SPECIFIC TYPE SELECTORS */}
          
          {/* FACIAL SKIN TYPE SELECTOR (Show if 'SKIN' or 'BOTH') */}
          {(concernCategory === 'SKIN' || concernCategory === 'BOTH') && (
            <div className="space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-teal-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Smile className="w-3.5 h-3.5 text-teal-400" />
                  <span>Select Facial Skin Type</span>
                </label>
                <span className="text-[10px] text-slate-500">Required for facial diagnosis</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {FACIAL_SKIN_TYPES.map((type) => (
                  <button
                    type="button"
                    key={type.id}
                    onClick={() => setFacialSkinType(type.id)}
                    className={`p-3 rounded-2xl border text-left transition-all relative ${
                      facialSkinType === type.id
                        ? 'bg-teal-500/20 border-teal-500 text-white shadow-md'
                        : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="font-bold text-xs text-white">{type.label}</div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">{type.desc}</div>
                    {facialSkinType === type.id && (
                      <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-teal-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* HAIR & SCALP TYPE SELECTOR (Show if 'HAIR' or 'BOTH') */}
          {(concernCategory === 'HAIR' || concernCategory === 'BOTH') && (
            <div className="space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-indigo-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Scissors className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Select Hair & Scalp Condition</span>
                </label>
                <span className="text-[10px] text-slate-500">Required for scalp diagnosis</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {HAIR_SCALP_TYPES.map((type) => (
                  <button
                    type="button"
                    key={type.id}
                    onClick={() => setHairScalpType(type.id)}
                    className={`p-3 rounded-2xl border text-left transition-all relative ${
                      hairScalpType === type.id
                        ? 'bg-indigo-500/20 border-indigo-500 text-white shadow-md'
                        : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="font-bold text-xs text-white">{type.label}</div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">{type.desc}</div>
                    {hairScalpType === type.id && (
                      <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-indigo-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SUMMARY BADGE OF CURRENT SELECTIONS */}
          <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-3 text-xs flex items-center justify-between">
            <span className="text-slate-400 font-medium">Selected Assessment Scope:</span>
            <div className="flex items-center space-x-2">
              {(concernCategory === 'SKIN' || concernCategory === 'BOTH') && (
                <span className="bg-teal-500/10 border border-teal-500/20 text-teal-300 px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                  Skin: {facialSkinType}
                </span>
              )}
              {(concernCategory === 'HAIR' || concernCategory === 'BOTH') && (
                <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                  Hair: {hairScalpType}
                </span>
              )}
            </div>
          </div>

          {/* STEP 3. Chief Complaint Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              3. Describe Symptoms & Duration <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <textarea
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                placeholder="Describe your skin and/or scalp concern (e.g. Red itchy papules on cheeks along with hairline thinning for 2 weeks)..."
                rows={3}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
              />
              <FileText className="w-4 h-4 text-slate-600 absolute bottom-3 right-3 pointer-events-none" />
            </div>
          </div>

          {/* STEP 4. Photo Attachment Uploads */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              4. Upload Condition Photos (Optional but recommended)
            </label>

            {/* Current Attachments */}
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mb-3">
              {photos.map((img, idx) => (
                <div key={idx} className="relative group rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 aspect-square">
                  <img src={img.url} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(idx)}
                    className="absolute top-1.5 right-1.5 p-1 bg-slate-900/80 hover:bg-rose-600 text-white rounded-full transition-all opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <span className="absolute bottom-1 left-1 right-1 bg-slate-950/80 text-[9px] text-slate-300 px-1.5 py-0.5 rounded truncate text-center">
                    {img.caption}
                  </span>
                </div>
              ))}

              {/* Add Custom Image URL Dropzone */}
              <div className="border border-dashed border-slate-700 rounded-2xl p-2 flex flex-col items-center justify-center text-center bg-slate-950/30 hover:border-indigo-500/50 transition-all aspect-square">
                <Camera className="w-5 h-5 text-indigo-400 mb-1" />
                <span className="text-[10px] text-slate-400 font-medium">Add Photo</span>
              </div>
            </div>

            {/* Preset Selector for Fast Demo */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1">
              <span className="text-[10px] text-slate-500 whitespace-nowrap">Quick Demo Presets:</span>
              {PRESET_CLINICAL_PHOTOS.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleAddPhoto(preset.url, preset.label)}
                  className="bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[10px] px-2.5 py-1 rounded-full whitespace-nowrap transition-all"
                >
                  + {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* ERROR ALERT */}
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-2xl text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* FINANCIAL SUMMARY & SUBMIT */}
          <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <IndianRupee className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">1-Time Session Fee</div>
                <div className="text-lg font-bold text-white flex items-center space-x-1">
                  <span>₹300</span>
                  <span className="text-[10px] font-normal text-slate-400">(Valid for 24 Hrs)</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold text-xs px-6 py-3 rounded-2xl shadow-lg shadow-indigo-500/20 flex items-center space-x-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <span>Initializing...</span>
              ) : (
                <>
                  <span>Start 24-Hr Session</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
