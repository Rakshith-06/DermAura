import React, { useState } from 'react';
import dermAuraLogo from '../dermAuraLogoNoBG.png';
import {
  User,
  ArrowLeft,
  Crown,
  Mail,
  Phone,
  HeartPulse,
  Pill,
  Scan,
  ShieldCheck,
  Video,
  FileText,
  Unlock,
  Lock,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Stethoscope,
  Send,
  Sparkles,
  Calendar,
  ShieldAlert,
  Plus,
  ChevronRight,
  Brain,
  Download,
  Printer
} from 'lucide-react';

export default function IndividualPatientProfileView({
  patient = null,
  prescriptions = [],
  sessionRequests = [],
  onBack = () => {},
  onStartVideo = () => {},
  onIssueRx = () => {},
  onUnlockProduct = () => {}
}) {
  if (!patient) return null;

  const [activeSubTab, setActiveSubTab] = useState('clinical'); // 'clinical' | 'scans' | 'notifications'
  const [noteInput, setNoteInput] = useState('');
  const [showStressReportModal, setShowStressReportModal] = useState(false);
  const [clinicalNotes, setClinicalNotes] = useState([
    { id: 1, date: 'Today, 10:30 AM', author: 'Dr. Sarah Jenkins', note: 'Patient shows Grade II Facial Acne Vulgaris on cheek area with mild post-inflammatory hyperpigmentation. Recommended Tretinoin 0.05% gel.' }
  ]);

  const defaultPatientStressReport = {
    patientName: patient.name,
    score: 15,
    maxPts: 20,
    percentage: 75,
    category: 'High Cortisol Flare Risk (High Stress)',
    badgeColor: 'bg-rose-950 text-rose-300 border-rose-800',
    summary: 'Elevated systemic stress detected. High clinical correlation with inflammatory facial acne papules, scalp seborrheic flares, and hair shedding.',
    recommendations: [
      'Prioritize 7-8 hours of uninterrupted sleep to regulate serum cortisol.',
      'Share this report with your DermAura Dermatologist for targeted anti-inflammatory skincare advice.',
      'Incorporate 15 minutes of mindfulness or light evening walks.'
    ],
    detailedAnswers: [
      {
        id: 'q1',
        question: '1. How frequently do you experience sleep disruption or insomnia?',
        selectedOption: 'Frequent (3-4 nights a week)',
        pts: 3
      },
      {
        id: 'q2',
        question: '2. How often do you feel under intense mental pressure or anxiety?',
        selectedOption: 'High workload & frequent stress',
        pts: 3
      },
      {
        id: 'q3',
        question: '3. Do your facial skin breakouts or scalp itching flare during stressful weeks?',
        selectedOption: 'Severe acute skin outbreaks & hair shedding',
        pts: 4
      },
      {
        id: 'q4',
        question: '4. How much daily time do you dedicate to relaxation, exercise, or mindfulness?',
        selectedOption: 'Under 15 minutes daily',
        pts: 3
      },
      {
        id: 'q5',
        question: '5. Do you experience physical fatigue, tension headaches, or jaw clenching?',
        selectedOption: 'Frequently during stressful periods',
        pts: 2
      }
    ],
    sharedAt: 'Today, 10:15 AM'
  };

  const handleDownloadReportPDF = () => {
    const printWindow = window.open('', '_blank', 'width=900,height=1100');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>DermAura Clinical Report - ${patient.name}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0f172a; padding: 40px; margin: 0; background: #ffffff; line-height: 1.5; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #0d9488; padding-bottom: 16px; margin-bottom: 24px; }
            .brand { font-size: 26px; font-weight: 900; color: #0d9488; letter-spacing: -0.5px; }
            .subtitle { font-size: 11px; color: #64748b; font-family: monospace; text-transform: uppercase; margin-top: 2px; }
            .sec-header { font-size: 13px; font-weight: 800; color: #0f172a; border-left: 4px solid #0d9488; padding-left: 10px; margin-top: 24px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
            .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0; font-size: 12px; }
            .grid-item { display: flex; justify-content: space-between; }
            .lbl { color: #64748b; font-weight: 600; }
            .val { font-weight: 700; color: #0f172a; }
            .card { background: #f8fafc; border: 1px solid #cbd5e1; padding: 16px; border-radius: 12px; font-size: 12px; margin-bottom: 16px; }
            .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; background: #ccfbf1; color: #0f766e; border: 1px solid #99f6e4; }
            .badge-danger { background: #ffe4e6; color: #be123c; border: 1px solid #fecdd3; }
            .q-list { list-style: none; padding: 0; margin: 8px 0 0 0; }
            .q-item { padding: 8px 12px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 6px; font-size: 11px; }
            .doctor-sig { margin-top: 40px; padding-top: 20px; border-top: 2px solid #cbd5e1; display: flex; justify-content: space-between; font-size: 12px; }
            @media print {
              body { padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="brand" style="display: flex; align-items: center; gap: 8px;">
                <img src="${dermAuraLogo}" style="height: 24px; vertical-align: middle; margin-right: 6px;" alt="DermAura" />
                DermAura Tele-Health
              </div>
              <div class="subtitle">Official Patient AI DermScan & Stress Analyzer Quiz Report</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 12px; font-weight: 800; color: #0f172a;">Date: ${new Date().toLocaleDateString()}</div>
              <div class="subtitle">Doc Ref: #PAT-${patient.id || '1'}</div>
            </div>
          </div>

          <div class="sec-header">1. Patient Metadata</div>
          <div class="grid-2">
            <div class="grid-item"><span class="lbl">Patient Name:</span> <span class="val">${patient.name}</span></div>
            <div class="grid-item"><span class="lbl">Age & Gender:</span> <span class="val">${patient.age} Yrs, ${patient.gender}</span></div>
            <div class="grid-item"><span class="lbl">Blood Group:</span> <span class="val">${patient.bloodGroup || 'O+'}</span></div>
            <div class="grid-item"><span class="lbl">Known Allergies:</span> <span class="val">${Array.isArray(patient.allergies) ? patient.allergies.join(', ') : patient.allergies}</span></div>
            <div class="grid-item"><span class="lbl">Chief Concern:</span> <span class="val">${patient.concern}</span></div>
            <div class="grid-item"><span class="lbl">Affected Region:</span> <span class="val">${patient.anatomicRegion || 'Malar Cheeks & T-Zone'}</span></div>
          </div>

          <div class="sec-header">2. AI DermScan Visual Lesion Analysis & Triage</div>
          <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <strong style="font-size: 15px; color: #0f766e;">AI Predicted Triage: ${patient.aiTriage || 'Acne Vulgaris'}</strong>
              <span class="badge">Match: 95.4%</span>
            </div>
            <p style="margin: 4px 0;"><strong>Severity Rating:</strong> Moderate Inflammatory</p>
            <p style="margin: 4px 0;"><strong>Sebum Output:</strong> 7.8 / 10 (Elevated)</p>
          </div>

          <div class="sec-header">3. Stress Analyzer Quiz & Cortisol Flare Profile</div>
          <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <strong>Cortisol Score: ${defaultPatientStressReport.score} / ${defaultPatientStressReport.maxPts} (${defaultPatientStressReport.percentage}%)</strong>
              <span class="badge badge-danger">${defaultPatientStressReport.category}</span>
            </div>
            <p style="margin-bottom: 12px; font-style: italic; color: #334155; font-size: 11px;">"${defaultPatientStressReport.summary}"</p>
            
            <div style="font-weight: 700; margin-bottom: 8px; font-size: 11px; text-transform: uppercase; color: #475569;">Itemized Quiz Responses:</div>
            <div class="q-list">
              ${defaultPatientStressReport.detailedAnswers.map(q => `
                <div class="q-item">
                  <div style="font-weight: 700; color: #1e293b;">${q.question}</div>
                  <div style="color: #0d9488; margin-top: 2px;">• Selected Option: <strong>${q.selectedOption}</strong> (+${q.pts} pts)</div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="doctor-sig">
            <div>
              <div><strong>Verified By:</strong> Dr. Sarah Jenkins</div>
              <div style="color: #64748b; font-size: 10px;">DermAura Tele-Health Portal</div>
            </div>
            <div style="text-align: right;">
              <div><strong>Digital Stamp:</strong> Doctor Signed 🟢</div>
              <div style="color: #64748b; font-size: 10px;">Timestamp: ${new Date().toLocaleString()}</div>
            </div>
          </div>

          <div class="no-print" style="margin-top: 30px; text-align: center;">
            <button onclick="window.print()" style="padding: 12px 28px; background: #0d9488; color: #fff; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 13px;">📥 Save / Print PDF Report</button>
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!noteInput.trim()) return;
    setClinicalNotes([
      { id: Date.now(), date: 'Just Now', author: 'Dr. Sarah Jenkins', note: noteInput.trim() },
      ...clinicalNotes
    ]);
    setNoteInput('');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in">
      
      {/* TOP NAVIGATION / BACK BUTTON */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-white hover:bg-stone-100 text-stone-700 text-xs font-bold rounded-2xl flex items-center space-x-2 border border-stone-200 transition-all shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Patient Queue</span>
        </button>

        <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-mono font-bold rounded-full">
          PATIENT ID: {patient.id || 'PAT-101'}
        </span>
      </div>

      {/* PATIENT PROFILE HEADER BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 border border-emerald-700/60 p-6 md:p-8 shadow-xl text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className="w-20 h-20 rounded-3xl bg-white border-2 border-emerald-300 flex items-center justify-center text-4xl shadow-md">
              {patient.photo || '👨‍💼'}
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-black text-white">{patient.name || 'Aarav Sharma'}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/20 border border-white/30 text-white flex items-center space-x-1">
                  <Crown className="w-3 h-3 text-amber-300" />
                  <span>DermAura Verified Patient</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-emerald-100 mt-2">
                <span className="font-mono text-white font-bold">
                  {patient.age || 26} Yrs ({patient.gender || 'Male'})
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1 text-emerald-100">
                  <Mail className="w-3.5 h-3.5 text-emerald-200" />
                  <span>{patient.email || 'patient@dermaura.com'}</span>
                </span>
                <span>•</span>
                <span className="font-mono text-white font-bold">Blood Group: {patient.bloodGroup || 'O+'}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onStartVideo(patient)}
              className="px-4 py-2.5 bg-white hover:bg-emerald-50 text-emerald-900 font-bold text-xs rounded-2xl flex items-center space-x-2 transition-all shadow-sm cursor-pointer"
            >
              <Video className="w-4 h-4 text-emerald-700" />
              <span>Start Video Call 📹</span>
            </button>

            <button
              onClick={() => onIssueRx(patient)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl flex items-center space-x-2 transition-all shadow-sm cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Issue E-Prescription 📝</span>
            </button>
          </div>
        </div>
      </div>

      {/* SUB-TABS NAVIGATION */}
      <div className="flex items-center space-x-3 border-b border-stone-200 pb-3">
        <button
          onClick={() => setActiveSubTab('clinical')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
            activeSubTab === 'clinical'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200'
          }`}
        >
          <HeartPulse className="w-4 h-4 text-rose-500" />
          <span>Clinical Profile & Baseline</span>
        </button>

        <button
          onClick={() => setActiveSubTab('scans')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
            activeSubTab === 'scans'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200'
          }`}
        >
          <Scan className="w-4 h-4 text-emerald-600" />
          <span>Uploaded DermScans & AI Triage</span>
        </button>

        <button
          onClick={() => setActiveSubTab('notifications')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
            activeSubTab === 'notifications'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200'
          }`}
        >
          <Clock className="w-4 h-4 text-amber-500" />
          <span>Consultation History & Alerts</span>
        </button>
      </div>

      {/* TAB 1: CLINICAL PROFILE & BASELINE */}
      {activeSubTab === 'clinical' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Primary Dermatological Baseline */}
            <div className="p-6 bg-white border border-stone-200 rounded-3xl space-y-4 shadow-xs">
              <h3 className="text-sm font-bold text-stone-900 flex items-center space-x-2">
                <Stethoscope className="w-5 h-5 text-emerald-600" />
                <span>Primary Chief Concern & Diagnosis</span>
              </h3>

              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                <span className="text-stone-500 font-mono text-[10px] uppercase font-bold block">Patient Stated Complaint</span>
                <p className="font-bold text-stone-900 text-sm">{patient.concern || 'Severe Facial Acne Vulgaris & Inflammatory Papules'}</p>
                <p className="text-xs text-stone-600">Anatomic Region: <span className="font-bold text-stone-800">{patient.anatomicRegion || 'Malar Cheeks & T-Zone'}</span></p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                  <span className="text-stone-500 font-mono text-[10px] uppercase font-bold">AI Lesion Triage Match</span>
                  <p className="font-bold text-emerald-700 text-sm">{patient.aiTriage || 'Acne Vulgaris (95.4% Match)'}</p>
                </div>

                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                  <span className="text-stone-500 font-mono text-[10px] uppercase font-bold">Consultation Urgency</span>
                  <p className="font-bold text-amber-700 text-sm">{patient.urgency || 'High'}</p>
                </div>
              </div>
            </div>

            {/* Allergies & Active Meds */}
            <div className="p-6 bg-white border border-stone-200 rounded-3xl space-y-4 shadow-xs">
              <h3 className="text-sm font-bold text-stone-900 flex items-center space-x-2">
                <Pill className="w-5 h-5 text-amber-600" />
                <span>Known Allergies & Active Regimen</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-1">
                  <span className="text-rose-700 font-bold text-[11px] uppercase block">Recorded Drug Allergies:</span>
                  <p className="text-rose-800 font-semibold">{patient.allergies ? (Array.isArray(patient.allergies) ? patient.allergies.join(', ') : patient.allergies) : 'Penicillin, Sulfa Drugs'}</p>
                </div>

                <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-1">
                  <span className="text-stone-700 font-bold text-[11px] uppercase block">Current Skincare & Rx:</span>
                  <p className="text-stone-600">Salicylic Acid 2% Cleanser, Gentle Hydrating Moisturizer</p>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: DOCTOR CLINICAL NOTES */}
          <div className="space-y-6">
            <div className="p-6 bg-white border border-stone-200 rounded-3xl space-y-4 shadow-xs">
              <h3 className="text-sm font-bold text-stone-900 flex items-center space-x-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <span>Doctor Clinical Notes</span>
              </h3>

              <form onSubmit={handleAddNote} className="space-y-2">
                <textarea
                  rows={3}
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Add clinical observation or advice for this patient..."
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
                <button
                  type="submit"
                  disabled={!noteInput.trim()}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Save Clinical Note</span>
                </button>
              </form>

              <div className="space-y-3 pt-2">
                {clinicalNotes.map((n) => (
                  <div key={n.id} className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-1 text-xs">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-emerald-700">{n.author}</span>
                      <span className="text-stone-500">{n.date}</span>
                    </div>
                    <p className="text-stone-700 leading-relaxed">{n.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SCANS, AI TRIAGE & STRESS ANALYZER QUIZ REPORT */}
      {activeSubTab === 'scans' && (
        <div className="bg-white border border-stone-200 rounded-3xl p-6 space-y-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between border-b border-stone-200 pb-3 gap-2">
            <h3 className="text-sm font-bold text-stone-900 flex items-center space-x-2">
              <Scan className="w-5 h-5 text-emerald-600" />
              <span>Uploaded DermScans, AI Triage & Stress Quiz Report for {patient.name}</span>
            </h3>

            <button
              onClick={handleDownloadReportPDF}
              className="px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 shadow-2xs"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Download PDF Report</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* DermScan Visual Photo */}
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
              <img
                src="https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600&auto=format&fit=crop&q=60"
                alt="Facial Lesion Scan"
                className="w-full h-48 rounded-xl object-cover border border-stone-200"
              />
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-900">Facial Acne Lesion Scan</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                  95.4% AI Match
                </span>
              </div>
              <p className="text-stone-500 text-[11px]">Uploaded Today, 09:45 AM • Moderate Inflammatory Severity</p>
            </div>

            {/* Patient Stress Analyzer Quiz Soft Report Card */}
            <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-4 shadow-2xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-emerald-800 font-bold uppercase flex items-center">
                    <Brain className="w-4 h-4 text-emerald-600 mr-1.5" />
                    <span>Stress Analyzer Quiz Soft Report</span>
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${defaultPatientStressReport.badgeColor?.includes('rose') ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'}`}>
                    {defaultPatientStressReport.category}
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-1">
                  <span className="text-[10px] font-mono text-stone-500 uppercase font-bold block">Cortisol Stress Impact Score</span>
                  <p className="text-sm font-bold text-rose-700">
                    {defaultPatientStressReport.score} / {defaultPatientStressReport.maxPts} ({defaultPatientStressReport.percentage}% Systemic Impact)
                  </p>
                </div>

                <p className="text-xs text-stone-700 italic leading-relaxed">
                  "{defaultPatientStressReport.summary}"
                </p>
              </div>

              <div className="pt-3 border-t border-emerald-200 flex items-center justify-between">
                <button
                  onClick={() => setShowStressReportModal(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>View Itemized Quiz Answers</span>
                </button>

                <button
                  onClick={handleDownloadReportPDF}
                  className="px-3.5 py-2 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>PDF Report</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CONSULTATION HISTORY, PAST PRESCRIPTIONS & ALERTS */}
      {activeSubTab === 'notifications' && (() => {
        // Filter prescriptions for this specific patient
        const patientRxList = prescriptions.filter(
          (rx) => rx.patientName?.toLowerCase() === patient.name?.toLowerCase() || rx.patientId === patient.id
        );

        // Fallback demo prescriptions for this patient if list is empty
        const displayRxList = patientRxList.length > 0 ? patientRxList : [
          {
            id: 'rx-501',
            patientName: patient.name,
            date: 'Today (19 Aug 2026)',
            time: '10:45 AM',
            medicines: [
              { name: 'Tretinoin 0.05% Facial Acne & Retinoid Gel', dosage: 'Pea-sized amount at night', duration: '30 Days' },
              { name: 'DermAura Gentle Hydrating Cleanser', dosage: 'Twice daily face wash', duration: 'Daily Care' }
            ],
            notes: 'Apply retinoid only at night after mild cleansing. Use SPF 50+ mineral sunscreen during daytime.',
            status: 'Issued & Unlocked 🔓'
          },
          {
            id: 'rx-409',
            patientName: patient.name,
            date: '04 Aug 2026',
            time: '11:30 AM',
            medicines: [
              { name: 'Salicylic Acid 2% Exfoliating Face Solution', dosage: 'Apply 3 drops every alternate evening', duration: '14 Days' }
            ],
            notes: 'Avoid scrubbing active papules. Discontinue if excessive dryness occurs.',
            status: 'Issued & Unlocked 🔓'
          }
        ];

        // Historical sessions log for this patient with Date & Time
        const displaySessions = [
          {
            id: 'sess-201',
            date: '19 Aug 2026',
            time: '10:30 AM',
            title: 'Live Video Tele-Consultation',
            doctor: 'Dr. Sarah Jenkins',
            status: 'Completed 🟢',
            rxIssued: true,
            notes: 'Full facial lesion evaluation via HD encrypted stream. Prescribed Tretinoin 0.05% retinoid therapy.'
          },
          {
            id: 'sess-202',
            date: '12 Aug 2026',
            time: '03:45 PM',
            title: '24-Hour Rapid Assessment Request',
            doctor: 'Dr. Sarah Jenkins',
            status: 'Completed 🟢',
            rxIssued: false,
            notes: 'Reviewed AI DermScan photo uploads & Cortisol stress flare report. Recommended baseline gentle care.'
          },
          {
            id: 'sess-203',
            date: '04 Aug 2026',
            time: '11:15 AM',
            title: 'Primary Lead PCP Onboarding Session',
            doctor: 'Dr. Sarah Jenkins',
            status: 'Completed 🟢',
            rxIssued: true,
            notes: 'Established primary care provider gatekeeper relationship. Verified drug allergies.'
          }
        ];

        return (
          <div className="space-y-6">
            
            {/* CLINICAL ALERTS & ALLERGY WARNING BANNER */}
            <div className="p-5 bg-amber-50 border border-amber-200 rounded-3xl space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <ShieldAlert className="w-5 h-5 text-amber-600" />
                  <h4 className="text-sm font-bold text-stone-900">Active Patient Clinical Alerts & Drug Warnings</h4>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  Patient Safety Protocol
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-white rounded-2xl border border-rose-200 space-y-1">
                  <span className="text-rose-700 font-bold text-[10px] uppercase block">Recorded Drug Allergies</span>
                  <p className="text-rose-800 font-semibold">{patient.allergies ? (Array.isArray(patient.allergies) ? patient.allergies.join(', ') : patient.allergies) : 'Penicillin, Sulfa Drugs'}</p>
                </div>
                <div className="p-3.5 bg-white rounded-2xl border border-stone-200 space-y-1">
                  <span className="text-amber-800 font-bold text-[10px] uppercase block">PCP Gatekeeper Scope</span>
                  <p className="text-stone-700">Primary Lead Doctor: <strong className="text-stone-900">Dr. Sarah Jenkins</strong></p>
                </div>
              </div>
            </div>

            {/* SECTION 1: PAST TELE-CONSULTATION SESSIONS LOG WITH DATE & TIME */}
            <div className="p-6 bg-white border border-stone-200 rounded-3xl space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div className="flex items-center space-x-2.5">
                  <Clock className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h3 className="text-sm font-bold text-stone-900">Past Tele-Consultation Sessions Log</h3>
                    <p className="text-[11px] text-stone-500">Historical sessions held with {patient.name} including date, time, and clinical outcomes.</p>
                  </div>
                </div>
                <button
                  onClick={() => onStartVideo(patient)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Start New Session</span>
                </button>
              </div>

              <div className="space-y-3 text-xs">
                {displaySessions.map((sess) => (
                  <div key={sess.id} className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-2.5 hover:border-emerald-300 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-600" />
                        <h4 className="font-bold text-stone-900 text-xs">{sess.title}</h4>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-white text-stone-700 border border-stone-200 font-mono text-[10px] font-bold flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-amber-500 mr-1" />
                          <span>{sess.date}</span>
                          <span className="text-stone-400">|</span>
                          <span className="text-emerald-700">{sess.time}</span>
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono font-bold">
                          {sess.status}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-stone-200 text-stone-700 space-y-1">
                      <div className="flex justify-between text-[10px] text-stone-500">
                        <span>Attending Doctor: <strong className="text-stone-900">{sess.doctor}</strong></span>
                        {sess.rxIssued && <span className="text-emerald-700 font-bold">📝 E-Prescription Issued</span>}
                      </div>
                      <p className="text-xs text-stone-800">{sess.notes}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 2: PAST E-PRESCRIPTIONS FOR THIS PATIENT */}
            <div className="p-6 bg-white border border-stone-200 rounded-3xl space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div className="flex items-center space-x-2.5">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h3 className="text-sm font-bold text-stone-900">Past E-Prescriptions ({displayRxList.length})</h3>
                    <p className="text-[11px] text-stone-500">All digital prescriptions signed and unlocked during clinical sessions for {patient.name}.</p>
                  </div>
                </div>
                <button
                  onClick={() => onIssueRx(patient)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Issue New E-Prescription</span>
                </button>
              </div>

              <div className="space-y-4 text-xs">
                {displayRxList.map((rx) => (
                  <div key={rx.id} className="p-5 bg-stone-50 border border-stone-200 rounded-2xl space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-stone-200 pb-2.5">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <span className="font-bold text-stone-900 text-xs">Prescription #{rx.id}</span>
                          <div className="flex items-center space-x-2 text-[10px] text-stone-500 font-mono">
                            <span>Issued: {rx.date} {rx.time ? `at ${rx.time}` : ''}</span>
                            <span>•</span>
                            <span className="text-stone-600">Target: {rx.patientName}</span>
                          </div>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-mono font-bold text-[10px]">
                        {rx.status || 'Issued & Unlocked 🔓'}
                      </span>
                    </div>

                    {/* Prescribed Items */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono text-stone-500 uppercase block font-bold">Prescribed Medicines & Regimen:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {rx.medicines && rx.medicines.map((med, i) => (
                          <div key={i} className="p-3 bg-white rounded-xl border border-stone-200 space-y-0.5">
                            <p className="font-bold text-stone-900 text-xs">{med.name}</p>
                            <p className="text-[11px] text-stone-600">Dosage: {med.dosage}</p>
                            <span className="text-[10px] font-mono text-emerald-700 block font-semibold">Duration: {med.duration}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Clinical Warnings & Instructions */}
                    {rx.notes && (
                      <div className="p-3 bg-white rounded-xl border border-stone-200 text-xs space-y-1">
                        <span className="text-[10px] font-mono text-amber-800 uppercase font-bold block">Doctor Clinical Instructions:</span>
                        <p className="text-stone-700 italic">"{rx.notes}"</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        );
      })()}

      {/* PATIENT STRESS ANALYZER QUIZ SOFT REPORT MODAL */}
      {showStressReportModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 w-full max-w-2xl rounded-3xl p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900 flex items-center space-x-2">
                    <span>Stress Analyzer Quiz Report</span>
                  </h3>
                  <p className="text-xs text-stone-500 font-mono">Patient: {patient.name} • Shared Today</p>
                </div>
              </div>

              <button
                onClick={() => setShowStressReportModal(false)}
                className="p-2 text-stone-400 hover:text-stone-700 rounded-xl bg-stone-100 hover:bg-stone-200 transition-all"
              >
                ✕
              </button>
            </div>

            {/* Cortisol Impact Summary */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-emerald-800 uppercase font-bold">Cortisol Impact Rating</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${defaultPatientStressReport.badgeColor?.includes('rose') ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'}`}>
                  {defaultPatientStressReport.category}
                </span>
              </div>
              <p className="text-xs text-stone-700 leading-relaxed">{defaultPatientStressReport.summary}</p>
            </div>

            {/* Itemized Quiz Questions & Answers */}
            <div className="space-y-3 pt-2 border-t border-stone-200">
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider font-mono flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Itemized Patient Quiz Answers ({defaultPatientStressReport.detailedAnswers.length} Questions)</span>
              </h4>

              <div className="space-y-2.5">
                {defaultPatientStressReport.detailedAnswers.map((item, idx) => (
                  <div key={idx} className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-stone-900">{item.question}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono font-bold flex-shrink-0">
                        +{item.pts} Pts
                      </span>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-stone-200 flex items-center space-x-2 text-xs text-stone-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>Selected Option: <strong className="text-stone-900">{item.selectedOption}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Bottom Action Bar */}
            <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
              <button
                onClick={handleDownloadReportPDF}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF Clinical Report</span>
              </button>

              <button
                onClick={() => setShowStressReportModal(false)}
                className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition-all"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
