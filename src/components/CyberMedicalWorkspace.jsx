import React, { useState, useRef, useEffect } from 'react';
import dermAuraLogo from '../dermAuraLogoNoBG.png';
import {
  Activity,
  Camera,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  HeartPulse,
  Lock,
  MessageSquare,
  Paperclip,
  Pill,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  User,
  AlertTriangle,
  X,
  ZoomIn,
  ZoomOut,
  Sliders,
  Maximize2,
  ShieldAlert,
  Check,
  FileCheck,
  Layers,
  Eye,
  RotateCcw,
  Send,
  UploadCloud,
  Info,
  PenTool
} from 'lucide-react';

export default function CyberMedicalWorkspace({ onBack }) {
  // Top level active tab: 'patient' (Workspace A) | 'clinical' (Workspace B)
  const [activeWorkspace, setActiveWorkspace] = useState('patient');

  // Workspace A: Patient State
  const [skinHealthScore, setSkinHealthScore] = useState(88);
  const [cameraActive, setCameraActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [uploadedScanImage, setUploadedScanImage] = useState(
    'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800&auto=format&fit=crop&q=80'
  );
  const [showLesionContours, setShowLesionContours] = useState(true);

  // Treatment Checklist State
  const [checklist, setChecklist] = useState([
    { id: 'm1', timeSlot: 'Morning (08:00 AM)', med: 'Tretinoin 0.05% Topical Gel', completed: true },
    { id: 'm2', timeSlot: 'Morning (08:30 AM)', med: 'Broad Spectrum SPF 50 Mineral Sunscreen', completed: true },
    { id: 'e1', timeSlot: 'Evening (08:00 PM)', med: 'Gentle Ceramide Hydrating Cleanser', completed: false },
    { id: 'e2', timeSlot: 'Evening (08:30 PM)', med: 'Hydrocortisone 1% Localized Cream', completed: false },
  ]);

  // Weekly Adherence percentage computed dynamically
  const completedCount = checklist.filter((item) => item.completed).length;
  const adherenceRate = Math.round((completedCount / checklist.length) * 100);

  const toggleCheckItem = (id) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  // Floating Doctor Chat State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'doctor',
      name: 'Dr. Sarah Jenkins',
      role: 'Chief Dermatologist',
      text: 'Hello Aarav. I reviewed your DermScan AI output. The cheek inflammation shows steady reduction. Keep following the evening ceramide protocol!',
      time: '10:42 AM',
    },
    {
      id: 2,
      sender: 'patient',
      name: 'Aarav Sharma',
      text: 'Thanks Dr. Sarah! Should I re-apply the mineral sunscreen if I go out in the afternoon?',
      time: '10:45 AM',
    },
  ]);
  const [chatInput, setChatInput] = useState('');

  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const newMsg = {
      id: Date.now(),
      sender: 'patient',
      name: 'Aarav Sharma',
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput('');
  };

  // Workspace B: Clinical Workstation State
  const [selectedPatientId, setSelectedPatientId] = useState('p1');
  const [patientQueue, setPatientQueue] = useState([
    {
      id: 'p1',
      name: 'Aarav Sharma',
      age: 28,
      gender: 'Male',
      urgency: 'Urgent AI Alert',
      urgencyColor: 'coral', // neon coral #EF4444
      complaint: 'Facial Rosacea & Papule Flare',
      confidence: '89.4%',
      condition: 'Mild Rosacea / Erythema',
      baselineImg: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80',
      currentImg: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800&auto=format&fit=crop&q=80',
      escrowStatus: 'Verified (₹500 Deposit)',
    },
    {
      id: 'p2',
      name: 'Priya Nambiar',
      age: 32,
      gender: 'Female',
      urgency: 'Pending Approval',
      urgencyColor: 'amber', // amber #F59E0B
      complaint: 'Scalp Seborrheic Flare & Itch',
      confidence: '96.2%',
      condition: 'Seborrheic Scalp Dermatitis',
      baselineImg: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80',
      currentImg: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80',
      escrowStatus: 'Verified (₹1200 Escrow)',
    },
    {
      id: 'p3',
      name: 'Vikram Malhotra',
      age: 45,
      gender: 'Male',
      urgency: 'Stable Case',
      urgencyColor: 'emerald', // emerald #10B981
      complaint: 'Post-Acne Hyperpigmentation',
      confidence: '92.1%',
      condition: 'Post-Inflammatory Hyperpigmentation',
      baselineImg: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
      currentImg: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
      escrowStatus: 'Verified (₹500 Deposit)',
    },
  ]);

  const activePatient = patientQueue.find((p) => p.id === selectedPatientId) || patientQueue[0];

  // Comparison Canvas State
  const [sliderPosition, setSliderPosition] = useState(50); // percentage 0 - 100
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const isDraggingSlider = useRef(false);

  const handleSliderMouseDown = () => {
    isDraggingSlider.current = true;
  };

  useEffect(() => {
    const handleMouseUp = () => {
      isDraggingSlider.current = false;
    };
    const handleMouseMove = (e) => {
      if (!isDraggingSlider.current) return;
      const canvasEl = document.getElementById('comparison-canvas-container');
      if (!canvasEl) return;
      const rect = canvasEl.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(percentage);
    };

    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Rx Builder State
  const [rxSearch, setRxSearch] = useState('');
  const [prescribedMeds, setPrescribedMeds] = useState([
    { id: 'rx1', name: 'Tretinoin 0.05% Topical Gel', dosage: 'Apply thin layer once daily at night', duration: '14 Days' },
    { id: 'rx2', name: 'Ketoconazole 2% Scalp Solution', dosage: 'Apply twice weekly to damp scalp', duration: '30 Days' },
  ]);
  const [rxNotes, setRxNotes] = useState('Maintain gentle facial cleansing. Re-evaluate lesion boundaries in 14 days.');
  const [signedState, setSignedState] = useState(false);
  const [showRationaleModal, setShowRationaleModal] = useState(false);

  // Available Drug Master List for Autocomplete
  const drugMasterList = [
    { name: 'Tretinoin 0.05% Gel', category: 'Facial Acne Retinoid', defaultDosage: 'Apply thin layer once daily at night' },
    { name: 'Hydrocortisone 1% Cream', category: 'Dermatitis Anti-inflammatory', defaultDosage: 'Apply to affected area twice daily' },
    { name: 'Minoxidil 5% Solution', category: 'Scalp Hair Revitalizer', defaultDosage: '1ml applied twice daily to scalp' },
    { name: 'Ketoconazole 2% Shampoo', category: 'Antifungal Scalp Treatment', defaultDosage: 'Use 2-3 times per week' },
    { name: 'Doxycycline 100mg Capsules', category: 'Oral Antibiotic', defaultDosage: '1 capsule daily after food' },
  ];

  const filteredDrugs = drugMasterList.filter((d) =>
    d.name.toLowerCase().includes(rxSearch.toLowerCase())
  );

  const addDrugToRx = (drug) => {
    setPrescribedMeds((prev) => [
      ...prev,
      { id: `rx-${Date.now()}`, name: drug.name, dosage: drug.defaultDosage, duration: '14 Days' },
    ]);
    setRxSearch('');
  };

  // Drag and drop image upload simulation with scanline
  const handleDropzoneUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedScanImage(url);
      triggerScanAnimation();
    }
  };

  const triggerScanAnimation = () => {
    setIsScanning(true);
    setScanProgress(0);
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 100;
        }
        return prev + 25;
      });
    }, 250);

    setTimeout(() => {
      setIsScanning(false);
      setSkinHealthScore(91);
    }, 1500);
  };

  return (
    <div className="w-full min-h-screen bg-[#0B132B] text-slate-100 font-sans selection:bg-[#00B4D8] selection:text-[#0B132B] flex flex-col relative overflow-x-hidden">
      
      {/* ── TOP WORKSPACE CONTROL BAR ── */}
      <header className="w-full bg-[#0B132B]/90 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 py-3 flex items-center justify-between z-40 sticky top-0 shadow-lg shadow-cyan-950/20">
        
        {/* Brand & Back Button */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {onBack && (
            <button
              onClick={onBack}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-[#00B4D8] text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center space-x-1"
            >
              <ChevronRight className="w-3.5 h-3.5 rotate-180" />
              <span>Portal Main</span>
            </button>
          )}

          <div className="flex items-center space-x-2">
            <img src={dermAuraLogo} alt="DermAura Logo" className="w-9 h-9 object-contain drop-shadow-md" />
            <div>
              <h1 className="text-lg font-black tracking-tight text-white flex items-center space-x-2">
                <span>Derm<span className="text-[#00B4D8]">Aura</span></span>
                <span className="px-2 py-0.5 text-[10px] uppercase font-mono font-bold tracking-widest bg-cyan-950/80 border border-cyan-500/40 text-[#90E0EF] rounded-full">
                  CYBER-MEDICAL V2.0
                </span>
              </h1>
            </div>
          </div>
        </div>

        {/* Workspace Switcher Tabs */}
        <div className="flex items-center bg-slate-900/90 p-1 rounded-2xl border border-slate-800/80">
          <button
            onClick={() => setActiveWorkspace('patient')}
            className={`flex items-center space-x-2 px-3.5 sm:px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeWorkspace === 'patient'
                ? 'bg-gradient-to-r from-[#00B4D8] to-[#1E3A8A] text-white shadow-lg shadow-[#00B4D8]/30 border border-cyan-400/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Workspace A: Patient & AI Scanner</span>
          </button>

          <button
            onClick={() => setActiveWorkspace('clinical')}
            className={`flex items-center space-x-2 px-3.5 sm:px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeWorkspace === 'clinical'
                ? 'bg-gradient-to-r from-[#00B4D8] to-[#1E3A8A] text-white shadow-lg shadow-[#00B4D8]/30 border border-cyan-400/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Workspace B: Clinical Workstation</span>
          </button>
        </div>

        {/* Telemetry Status & Design Rationale Trigger */}
        <div className="hidden lg:flex items-center space-x-3">
          <button
            onClick={() => setShowRationaleModal(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-cyan-300 hover:text-cyan-200 flex items-center space-x-1.5 transition-all shadow-md"
          >
            <Info className="w-3.5 h-3.5 text-[#00B4D8]" />
            <span>Design Rationale</span>
          </button>

          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-[11px] font-mono font-medium text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>AI NEURAL ENGINE ACTIVE</span>
          </div>
        </div>
      </header>


      {/* ── WORKSPACE CONTENT ── */}
      <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">

        {/* ========================================================================= */}
        {/* WORKSPACE A: PATIENT DASHBOARD & AI SCANNER */}
        {/* ========================================================================= */}
        {activeWorkspace === 'patient' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
            
            {/* LEFT COLUMN: AI DERMSCAN STUDIO (8 COLS) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Main DermScan Viewport Glassmorphic Card */}
              <div className="bg-[#0B132B]/80 backdrop-blur-md border border-slate-800 hover:border-cyan-500/50 rounded-3xl p-5 sm:p-6 shadow-xl shadow-cyan-950/20 transition-all duration-300 relative overflow-hidden group">
                
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-[#00B4D8]" />
                    <h2 className="text-lg font-bold text-white tracking-tight">AI DermScan Studio</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#00B4D8]/20 border border-[#00B4D8]/40 text-[#90E0EF]">
                      REAL-TIME OVERLAY
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCameraActive(!cameraActive)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                        cameraActive
                          ? 'bg-rose-950/80 border border-rose-800 text-rose-300'
                          : 'bg-slate-900 border border-slate-800 hover:border-[#00B4D8] text-slate-300'
                      }`}
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{cameraActive ? 'Close Camera' : 'Live Camera Overlay'}</span>
                    </button>

                    <button
                      onClick={() => setShowLesionContours(!showLesionContours)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                        showLesionContours
                          ? 'bg-cyan-950/80 border border-cyan-500/50 text-[#90E0EF]'
                          : 'bg-slate-900 border border-slate-800 text-slate-400'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>{showLesionContours ? 'Contours: ON' : 'Contours: OFF'}</span>
                    </button>
                  </div>
                </div>

                {/* Viewport Frame */}
                <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800/90 aspect-video flex items-center justify-center group/viewport">
                  
                  {cameraActive ? (
                    <div className="w-full h-full bg-slate-950 relative flex items-center justify-center">
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40 z-10" />
                      
                      {/* Live Camera Framing Guide Lines */}
                      <div className="w-64 h-64 border-2 border-dashed border-[#00B4D8] rounded-full absolute z-20 flex items-center justify-center animate-pulse">
                        <div className="w-2 h-2 rounded-full bg-[#00B4D8]" />
                      </div>
                      <div className="text-center z-20 space-y-2">
                        <p className="text-sm font-mono text-[#90E0EF] bg-slate-900/80 px-3 py-1 rounded-full border border-cyan-500/40">
                          Align Face / Lesion within target ring
                        </p>
                        <button
                          onClick={triggerScanAnimation}
                          className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#00B4D8] to-[#1E3A8A] text-white text-xs font-bold shadow-lg shadow-cyan-500/30 hover:scale-105 transition-all"
                        >
                          Capture & Run AI Scan
                        </button>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={uploadedScanImage}
                      alt="DermScan Subject"
                      className="w-full h-full object-cover transition-all duration-500 group-hover/viewport:scale-105"
                    />
                  )}

                  {/* Lesion Contour & Heatmap Highlight Bounding Overlay */}
                  {!cameraActive && showLesionContours && (
                    <div className="absolute inset-0 pointer-events-none z-10">
                      {/* Lesion boundary box */}
                      <div className="absolute top-[28%] left-[38%] w-[26%] h-[32%] border-2 border-[#EF4444] bg-[#EF4444]/15 rounded-2xl animate-pulse flex flex-col justify-between p-1.5">
                        <div className="flex justify-between items-center text-[9px] font-mono text-rose-300 font-bold bg-slate-950/80 px-1.5 py-0.5 rounded border border-rose-500/50 w-fit">
                          <span>LESIÓN #01: ERYTHEMA</span>
                        </div>
                        <span className="text-[9px] font-mono text-rose-300 text-right bg-slate-950/80 px-1.5 py-0.5 rounded border border-rose-500/50 w-fit self-end">
                          AI: 89.4%
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Scanline Animation Effect during scan */}
                  {isScanning && (
                    <div className="absolute inset-0 bg-[#00B4D8]/10 z-30 pointer-events-none flex flex-col justify-between">
                      <div
                        className="w-full h-1 bg-gradient-to-r from-transparent via-[#00B4D8] to-transparent shadow-[0_0_15px_#00B4D8] transition-all duration-300"
                        style={{ transform: `translateY(${scanProgress * 3.5}px)` }}
                      />
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-slate-950/90 border border-cyan-500/60 text-xs font-mono font-bold text-[#90E0EF] shadow-2xl flex items-center space-x-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-[#00B4D8]" />
                        <span>RUNNING AI CONVOLUTIONAL SCAN... {scanProgress}%</span>
                      </div>
                    </div>
                  )}

                  {/* Hover Upload Button */}
                  <label className="absolute bottom-3 right-3 z-20 px-3 py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-700/80 hover:border-[#00B4D8] text-xs font-semibold text-slate-200 cursor-pointer transition-all flex items-center space-x-1.5">
                    <UploadCloud className="w-3.5 h-3.5 text-[#00B4D8]" />
                    <span>Upload Image</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleDropzoneUpload} />
                  </label>
                </div>

                {/* Skin Health Telemetry & Diagnostic Metrics */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  
                  {/* Metric 1: Skin Health Score */}
                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center space-x-4">
                    <div className="relative w-14 h-14 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="28" cy="28" r="22" stroke="#1E293B" strokeWidth="4" fill="transparent" />
                        <circle
                          cx="28"
                          cy="28"
                          r="22"
                          stroke="#10B981"
                          strokeWidth="4"
                          fill="transparent"
                          strokeDasharray={138}
                          strokeDashoffset={138 - (138 * skinHealthScore) / 100}
                          strokeLinecap="round"
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <span className="absolute font-mono font-black text-sm text-emerald-400">
                        {skinHealthScore}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] uppercase font-mono text-slate-400 font-semibold block">
                        Skin Health Score
                      </span>
                      <span className="text-sm font-bold text-white">88 / 100 (Optimal)</span>
                      <p className="text-[11px] text-emerald-400 flex items-center mt-0.5">
                        <CheckCircle2 className="w-3 h-3 mr-1 inline" /> +3 pts this week
                      </p>
                    </div>
                  </div>

                  {/* Metric 2: Primary AI Diagnostic */}
                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                    <span className="text-[11px] uppercase font-mono text-slate-400 font-semibold block mb-1">
                      AI Diagnostic Panel
                    </span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm font-bold text-slate-100">Mild Rosacea</span>
                      <span className="text-xs font-mono font-bold text-[#00B4D8]">89.4% Conf.</span>
                    </div>
                    <div className="w-full bg-slate-900 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-gradient-to-r from-[#00B4D8] to-[#90E0EF] h-full w-[89.4%]" />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">Lesion severity: Grade 1 Erythema</span>
                  </div>

                  {/* Metric 3: Risk Alert Telemetry */}
                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                    <span className="text-[11px] uppercase font-mono text-slate-400 font-semibold block mb-1">
                      Urgency Alert Triage
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] animate-ping" />
                      <span className="text-sm font-bold text-[#EF4444]">Urgent AI Alert</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Localized Cheek Erythema Requires Lead PCP Sign-off.
                    </p>
                  </div>
                </div>

              </div>

              {/* Drag and Drop Zone with Scanline Instruction */}
              <div className="p-4 rounded-2xl bg-slate-900/50 border border-dashed border-slate-700/80 hover:border-[#00B4D8] transition-all flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-[#00B4D8]">
                    <UploadCloud className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-200 block">Drop high-res macro photos here</span>
                    <span>Supports JPG, PNG, DICOM scan files (Up to 25MB)</span>
                  </div>
                </div>
                <button
                  onClick={triggerScanAnimation}
                  className="px-3.5 py-1.5 rounded-xl bg-[#00B4D8]/20 border border-[#00B4D8]/40 text-[#90E0EF] font-semibold hover:bg-[#00B4D8] hover:text-[#0B132B] transition-all"
                >
                  Run Demo Scan Effect ⚡
                </button>
              </div>

            </div>

            {/* RIGHT COLUMN: TREATMENT PROTOCOL & ADHERENCE CHART (4 COLS) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Daily Treatment Compliance Checklist Card */}
              <div className="bg-[#0B132B]/80 backdrop-blur-md border border-slate-800 hover:border-cyan-500/50 rounded-3xl p-5 sm:p-6 shadow-xl shadow-cyan-950/20 transition-all duration-300">
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Pill className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-base font-bold text-white tracking-tight">Treatment Protocol</h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
                    {adherenceRate}% TODAY
                  </span>
                </div>

                {/* Checklist items */}
                <div className="space-y-3">
                  {checklist.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleCheckItem(item.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start space-x-3 ${
                        item.completed
                          ? 'bg-slate-950/90 border-emerald-800/60 text-slate-200'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center mt-0.5 flex-shrink-0 transition-all ${
                          item.completed
                            ? 'bg-emerald-500 border-emerald-400 text-[#0B132B]'
                            : 'border-slate-700 bg-slate-950'
                        }`}
                      >
                        {item.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>

                      <div className="flex-1">
                        <span className="text-[10px] font-mono font-semibold text-[#00B4D8] block">
                          {item.timeSlot}
                        </span>
                        <span className={`text-xs font-bold ${item.completed ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                          {item.med}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Animated Weekly Adherence Bar Chart */}
                <div className="mt-6 pt-5 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-slate-300">Weekly Adherence Rate</span>
                    <span className="font-mono text-emerald-400 font-bold">85.7% Average</span>
                  </div>

                  <div className="grid grid-cols-7 gap-1.5 h-20 items-end pt-2">
                    {[
                      { day: 'M', val: 100 },
                      { day: 'T', val: 80 },
                      { day: 'W', val: 90 },
                      { day: 'T', val: 100 },
                      { day: 'F', val: 70 },
                      { day: 'S', val: 95 },
                      { day: 'S', val: adherenceRate },
                    ].map((d, idx) => (
                      <div key={idx} className="flex flex-col items-center space-y-1 h-full justify-end group/bar">
                        <div
                          className="w-full rounded-t-lg bg-gradient-to-t from-[#1E3A8A] via-[#00B4D8] to-emerald-400 transition-all duration-700 group-hover/bar:brightness-125"
                          style={{ height: `${d.val}%` }}
                        />
                        <span className="text-[10px] font-mono font-bold text-slate-400">{d.day}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}


        {/* ========================================================================= */}
        {/* WORKSPACE B: CLINICAL WORKSTATION (DOCTOR VIEW) */}
        {/* ========================================================================= */}
        {activeWorkspace === 'clinical' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
            
            {/* 1. TRIAGE QUEUE VERTICAL SIDEBAR (3 COLS) */}
            <div className="lg:col-span-3 space-y-4">
              <div className="bg-[#0B132B]/80 backdrop-blur-md border border-slate-800 rounded-3xl p-4 shadow-xl shadow-cyan-950/20">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Stethoscope className="w-4 h-4 text-[#00B4D8]" />
                    <span>Triage Queue</span>
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-950 border border-rose-800 text-rose-300">
                    3 ACTIVE
                  </span>
                </div>

                <div className="space-y-2.5">
                  {patientQueue.map((patient) => {
                    const isSelected = patient.id === selectedPatientId;
                    let badgeBg = 'bg-slate-900 border-slate-800 text-slate-400';
                    if (patient.urgencyColor === 'coral') badgeBg = 'bg-rose-950/90 border-rose-800 text-rose-300';
                    if (patient.urgencyColor === 'amber') badgeBg = 'bg-amber-950/90 border-amber-800 text-amber-300';
                    if (patient.urgencyColor === 'emerald') badgeBg = 'bg-emerald-950/90 border-emerald-800 text-emerald-300';

                    return (
                      <div
                        key={patient.id}
                        onClick={() => setSelectedPatientId(patient.id)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 border-[#00B4D8] shadow-lg shadow-cyan-950/40'
                            : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-white">{patient.name}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border ${badgeBg}`}>
                            {patient.urgency}
                          </span>
                        </div>

                        <span className="text-[11px] text-slate-400 block truncate">
                          {patient.complaint}
                        </span>

                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-[10px] font-mono">
                          <span className="text-cyan-300">AI: {patient.confidence}</span>
                          <span className="text-slate-500">{patient.escrowStatus}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 2. COMPARISON CANVAS WORKBENCH (6 COLS) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-[#0B132B]/80 backdrop-blur-md border border-slate-800 hover:border-cyan-500/50 rounded-3xl p-5 shadow-xl shadow-cyan-950/20 transition-all duration-300">
                
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center space-x-2">
                      <span>Comparison Canvas</span>
                      <span className="text-xs font-mono font-normal text-slate-400">
                        ({activePatient.name})
                      </span>
                    </h3>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setZoomLevel((prev) => Math.min(200, prev + 25))}
                      className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setZoomLevel((prev) => Math.max(100, prev - 25))}
                      className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setShowHeatmap(!showHeatmap)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold border transition-all ${
                        showHeatmap
                          ? 'bg-cyan-950 border-cyan-500/50 text-[#90E0EF]'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      HEATMAP: {showHeatmap ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>

                {/* Split-Screen Slider Canvas Box */}
                <div
                  id="comparison-canvas-container"
                  className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 aspect-video select-none cursor-ew-resize"
                >
                  {/* Baseline Image (Full Background) */}
                  <img
                    src={activePatient.baselineImg}
                    alt="Baseline Scan"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ transform: `scale(${zoomLevel / 100})` }}
                  />
                  <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full bg-slate-950/80 border border-slate-700 text-[10px] font-mono font-bold text-slate-300">
                    BASELINE (01 JAN)
                  </div>

                  {/* Current Scan Image (Clipped Overlay) */}
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ width: `${sliderPosition}%` }}
                  >
                    <img
                      src={activePatient.currentImg}
                      alt="Current Scan"
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{
                        width: '100%',
                        maxWidth: 'none',
                        transform: `scale(${zoomLevel / 100})`,
                      }}
                    />
                    <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full bg-cyan-950/90 border border-cyan-500/50 text-[10px] font-mono font-bold text-[#90E0EF]">
                      CURRENT SCAN (TODAY)
                    </div>

                    {/* Heatmap Lesion Overlay */}
                    {showHeatmap && (
                      <div className="absolute top-[30%] left-[35%] w-32 h-32 bg-rose-500/20 border-2 border-dashed border-rose-500 rounded-full animate-pulse pointer-events-none" />
                    )}
                  </div>

                  {/* Split Slider Handle Bar */}
                  <div
                    onMouseDown={handleSliderMouseDown}
                    className="absolute top-0 bottom-0 w-1 bg-[#00B4D8] z-20 cursor-ew-resize flex items-center justify-center shadow-[0_0_10px_#00B4D8]"
                    style={{ left: `${sliderPosition}%` }}
                  >
                    <div className="w-7 h-7 rounded-full bg-[#00B4D8] text-[#0B132B] flex items-center justify-center shadow-lg font-bold text-xs">
                      ↔
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>Zoom: {zoomLevel}%</span>
                  <span>Drag slider to compare baseline vs current lesion reduction</span>
                </div>

              </div>
            </div>

            {/* 3. RX BUILDER CLINICAL DECISION PANEL (3 COLS) */}
            <div className="lg:col-span-3 space-y-4">
              <div className="bg-[#0B132B]/80 backdrop-blur-md border border-slate-800 rounded-3xl p-4 shadow-xl shadow-cyan-950/20">
                
                <h3 className="text-sm font-bold text-white flex items-center space-x-2 mb-3">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  <span>Digital Rx Builder</span>
                </h3>

                {/* Medication Lookup Search Bar */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="text"
                    value={rxSearch}
                    onChange={(e) => setRxSearch(e.target.value)}
                    placeholder="Search medication database..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00B4D8]"
                  />

                  {/* Autocomplete Dropdown */}
                  {rxSearch.trim().length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-30 max-h-40 overflow-y-auto">
                      {filteredDrugs.map((d, i) => (
                        <div
                          key={i}
                          onClick={() => addDrugToRx(d)}
                          className="p-2 hover:bg-slate-800 cursor-pointer text-xs border-b border-slate-800/60 flex items-center justify-between"
                        >
                          <span className="font-semibold text-slate-200">{d.name}</span>
                          <Plus className="w-3 h-3 text-[#00B4D8]" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Prescribed Items List */}
                <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                  {prescribedMeds.map((med) => (
                    <div key={med.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                        <span>{med.name}</span>
                        <span className="text-[10px] font-mono text-[#00B4D8]">{med.duration}</span>
                      </div>
                      <p className="text-[10px] text-slate-400">{med.dosage}</p>
                    </div>
                  ))}
                </div>

                {/* Doctor Digital Signature Pad Area */}
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 mb-4">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span className="flex items-center space-x-1">
                      <PenTool className="w-3 h-3 text-[#00B4D8]" />
                      <span>E-SIGNATURE STAMP</span>
                    </span>
                    <button
                      onClick={() => setSignedState(!signedState)}
                      className="text-[10px] text-[#00B4D8] hover:underline"
                    >
                      {signedState ? 'Clear' : 'Sign'}
                    </button>
                  </div>

                  <div className="h-14 bg-slate-900/80 rounded-xl border border-dashed border-slate-700 flex items-center justify-center">
                    {signedState ? (
                      <span className="font-serif italic text-lg font-bold text-cyan-300">
                        Dr. Sarah Jenkins, MD
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500 font-mono">
                        Click 'Sign' to apply digital credential stamp
                      </span>
                    )}
                  </div>
                </div>

                {/* Approve & Unlock Pharmacy Button */}
                <button
                  onClick={() => alert(`Prescription issued & DermPharmacy unlocked for patient ${activePatient.name}!`)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center space-x-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Issue Rx & Unlock Pharmacy</span>
                </button>

              </div>
            </div>

          </div>
        )}

      </main>


      {/* ── FLOATING GLASSMORTHIC DOCTOR CHAT DRAWER ── */}
      <div className="fixed bottom-6 right-6 z-50">
        {!chatOpen ? (
          <button
            onClick={() => setChatOpen(true)}
            className="px-4 py-3 rounded-2xl bg-gradient-to-r from-[#00B4D8] to-[#1E3A8A] text-white font-bold text-xs shadow-2xl shadow-cyan-500/40 border border-cyan-400/40 hover:scale-105 transition-all flex items-center space-x-2"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Doctor Consultation Chat</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </button>
        ) : (
          <div className="w-80 sm:w-96 bg-[#0B132B]/95 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl shadow-cyan-950/80 overflow-hidden flex flex-col h-[420px] transition-all animate-fadeIn">
            
            {/* Header */}
            <div className="p-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#00B4D8] text-[#0B132B] font-bold flex items-center justify-center text-xs">
                  👨‍⚕️
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Dr. Sarah Jenkins, MD</h4>
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1" />
                    Encrypted Session Active
                  </span>
                </div>
              </div>

              <button
                onClick={() => setChatOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Message Area */}
            <div className="flex-1 p-3.5 overflow-y-auto space-y-3 custom-scrollbar text-xs">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'patient' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl ${
                      msg.sender === 'patient'
                        ? 'bg-gradient-to-r from-[#00B4D8] to-[#1E3A8A] text-white rounded-br-none'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                    }`}
                  >
                    <p>{msg.text}</p>
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 mt-1">{msg.time}</span>
                </div>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendChatMessage} className="p-2.5 bg-slate-950 border-t border-slate-800 flex items-center space-x-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type confidential message..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00B4D8]"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-[#00B4D8] hover:bg-cyan-400 text-[#0B132B] font-bold transition-all"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

          </div>
        )}
      </div>


      {/* ── DESIGN RATIONALE MODAL ── */}
      {showRationaleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0B132B] border border-slate-800 rounded-3xl p-6 w-full max-w-xl shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Info className="w-4 h-4 text-[#00B4D8]" />
                <span>Cyber-Medical Design Rationale</span>
              </h3>
              <button onClick={() => setShowRationaleModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
                <strong className="text-[#00B4D8] block mb-1">1. Information Density:</strong>
                <p>The multi-pane workstation eliminates context switching, enabling clinicians to review triage queues, compare high-res scans, and craft digital prescriptions simultaneously.</p>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
                <strong className="text-emerald-400 block mb-1">2. Trust Indicators:</strong>
                <p>Displays AI Confidence scores (e.g. 89.4%) and Lesion Contour bounding overlays to foster transparency between AI predictions and clinical decisions.</p>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
                <strong className="text-rose-400 block mb-1">3. Color Logic & Alert Fatigue Prevention:</strong>
                <p>Shifts from Ocean Teal to Neon Coral sparingly, ensuring high-urgency diagnostic alerts grab attention without overwhelming clinical workflow.</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowRationaleModal(false)}
                className="px-4 py-2 rounded-xl bg-[#00B4D8] text-[#0B132B] font-bold text-xs"
              >
                Close Rationale
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
