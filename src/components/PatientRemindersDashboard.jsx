import React, { useState } from 'react';
import { API_BASE } from '../api.js';
import {
  Pill,
  CheckCircle2,
  XCircle,
  Clock,
  Video,
  Calendar,
  IndianRupee,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  FileText,
  Stethoscope,
  Download,
  Eye,
  X
} from 'lucide-react';

const MOCK_TODAY_DOSES = [
  {
    id: 'dose-1',
    drugName: 'Minoxidil 5% Scalp Solution',
    dosage: '1ml',
    timeOfDay: 'Morning',
    scheduledTime: '08:00 AM',
    status: 'TAKEN', // 'TAKEN' | 'PENDING' | 'SKIPPED'
    instructions: 'Apply to scalp after shower',
  },
  {
    id: 'dose-2',
    drugName: 'Salicylic Acid 2% Gel',
    dosage: 'Pea-sized amount',
    timeOfDay: 'Afternoon',
    scheduledTime: '02:00 PM',
    status: 'TAKEN',
    instructions: 'Apply on affected facial lesions',
  },
  {
    id: 'dose-3',
    drugName: 'Minoxidil 5% Scalp Solution',
    dosage: '1ml',
    timeOfDay: 'Night',
    scheduledTime: '09:00 PM',
    status: 'PENDING',
    instructions: 'Apply to scalp 30 mins before sleep',
  },
];

const MOCK_UPCOMING_APPOINTMENT = {
  id: 'appt-991',
  doctorName: 'Dr. Sarah Jenkins',
  specialty: 'General Physician & Lead PCP',
  hospital: 'DermAura Care Network',
  photo: '👩‍⚕️',
  slotTime: '10:30 AM Today',
  scheduledAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
  meetLink: 'https://meet.dermaura.com/room-99182',
  status: 'SCHEDULED',
};

const MOCK_DOCTOR_HEALTH_REPORTS = [
  {
    id: 'rep-101',
    title: 'Lead PCP Clinical Diagnostic & Rx Authorization Report',
    category: 'Clinical Assessment',
    doctorName: 'Dr. Sarah Jenkins',
    doctorRole: 'Lead Primary Care Provider',
    date: 'Aug 18, 2026',
    badge: 'VERIFIED BY LEAD PCP 🟢',
    badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-800',
    summary: 'Initial consultation & scalp evaluation. Confirmed early-stage Androgenetic Alopecia and localized Seborrheic Dermatitis. Authorized 10-day targeted Minoxidil 5% & Salicylic Acid treatment regimen.',
    vitals: {
      scalpCondition: 'Mild Erythema',
      hairDensity: '145 hairs/cm²',
      prescribedRegimen: 'Minoxidil 5% + Salicylic Acid 2%',
      escrowStatus: '₹3,000 Active Escrow (₹300/day)',
    },
  },
  {
    id: 'rep-102',
    title: 'DermScan AI Follicular Visual Assessment',
    category: 'AI Visual Scan',
    doctorName: 'Dr. Vikramaditya Sen',
    doctorRole: 'Senior Dermatologist & Scalp Specialist',
    date: 'Aug 16, 2026',
    badge: 'CLINICAL SCAN VERIFIED 🔬',
    badgeColor: 'bg-teal-950 text-teal-300 border-teal-800',
    summary: 'Microscopic scalp scan verified by specialist. Follicular units exhibit early miniaturization in crown region. Patient instructed to maintain daily adherence tracking.',
    vitals: {
      scanConfidence: '96.4%',
      affectedArea: 'Crown & Temporal Line',
      recommendation: 'Daily topical application & weekly photo check-in',
    },
  },
  {
    id: 'rep-103',
    title: 'Serum Cortisol & Stress Impact Assessment',
    category: 'Stress Lab Report',
    doctorName: 'Dr. Ananya Patel',
    doctorRole: 'Holistic Dermatologist',
    date: 'Aug 12, 2026',
    badge: 'STRESS LAB COMPLETED ⚡',
    badgeColor: 'bg-indigo-950 text-indigo-300 border-indigo-800',
    summary: 'Stress-induced hair flare-up correlation analysis. Serum cortisol impact score rated at 6.8/10. Recommended nightly stress-reduction quiz protocol.',
    vitals: {
      cortisolLevel: '18.4 mcg/dL (Slightly High)',
      sleepQuality: '6.2 hrs avg',
      lifestylePlan: '30-min evening wind-down + Scalp massage',
    },
  },
];

export default function PatientRemindersDashboard({
  patientId = 'pat-aarav-101',
  treatmentDaysTotal = 10,
  treatmentDaysCompleted = 4,
  totalEscrowAmount = 3000,
  dailyRate = 300,
}) {
  const [activeTab, setActiveTab] = useState('doses'); // 'doses' | 'appointments' | 'treatment'
  const [doses, setDoses] = useState(MOCK_TODAY_DOSES);
  const [toastMessage, setToastMessage] = useState(null);
  const [selectedReportModal, setSelectedReportModal] = useState(null);

  // Escrow Calculations in INR ₹
  const amountUsed = treatmentDaysCompleted * dailyRate; // e.g. 4 * 300 = ₹1,200
  const escrowRemaining = Math.max(0, totalEscrowAmount - amountUsed); // e.g. ₹1,800
  const progressPercent = Math.round((treatmentDaysCompleted / treatmentDaysTotal) * 100);

  const handleMarkDose = async (doseId, newStatus) => {
    const doseObj = doses.find((d) => d.id === doseId);
    if (!doseObj) return;

    try {
      await fetch(`${API_BASE}/api/medications/log`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          timeOfDay: doseObj.timeOfDay,
          status: newStatus,
          patientFeedback: `Logged ${newStatus} via patient dashboard`,
        }),
      });
    } catch (e) {}

    setDoses((prev) =>
      prev.map((d) => (d.id === doseId ? { ...d, status: newStatus } : d))
    );

    setToastMessage(
      newStatus === 'TAKEN'
        ? `Great job! Marked ${doseObj.drugName} (${doseObj.timeOfDay}) as TAKEN.`
        : `Marked ${doseObj.drugName} as SKIPPED.`
    );

    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl text-slate-100 relative overflow-hidden">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-950 border border-emerald-500/40 text-emerald-300 p-4 rounded-2xl shadow-2xl text-xs font-semibold flex items-center space-x-3 animate-in slide-in-from-top-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Tabs */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-5 mb-6 gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Patient Care Portal</h2>
          <p className="text-slate-400 text-xs mt-0.5">Daily adherence tracker, scheduled tele-consultations, treatment escrow & doctor health reports</p>
        </div>

        {/* Tab Buttons */}
        <div className="bg-slate-950 p-1.5 rounded-2xl border border-slate-800 flex items-center space-x-1">
          <button
            onClick={() => setActiveTab('doses')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'doses'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Today's Doses
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'appointments'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Appointments
          </button>
          <button
            onClick={() => setActiveTab('treatment')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'treatment'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Treatment Progress & Reports
          </button>
        </div>
      </div>

      {/* TAB 1: TODAY'S MEDICATION DOSES */}
      {activeTab === 'doses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Scheduled Doses ({doses.filter((d) => d.status === 'TAKEN').length}/{doses.length} Completed)
            </h3>
            <span className="text-xs text-indigo-400 font-medium">Daily Goal: 100%</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {doses.map((dose) => (
              <div
                key={dose.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 relative overflow-hidden ${
                  dose.status === 'TAKEN'
                    ? 'bg-emerald-950/20 border-emerald-500/30'
                    : dose.status === 'SKIPPED'
                    ? 'bg-slate-950/50 border-slate-800 opacity-60'
                    : 'bg-slate-950/70 border-indigo-500/40 shadow-lg'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full font-mono ${
                        dose.timeOfDay === 'Morning'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : dose.timeOfDay === 'Afternoon'
                          ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                          : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      }`}
                    >
                      {dose.timeOfDay} ({dose.scheduledTime})
                    </span>

                    {dose.status === 'TAKEN' && (
                      <span className="text-emerald-400 text-xs font-bold flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>TAKEN</span>
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-sm text-white">{dose.drugName}</h4>
                  <div className="text-xs text-indigo-300 font-mono mt-0.5">{dose.dosage}</div>
                  <p className="text-[11px] text-slate-400 mt-2 italic">{dose.instructions}</p>
                </div>

                {/* ONE-TAP ACTION BUTTONS */}
                {dose.status !== 'TAKEN' ? (
                  <div className="flex items-center space-x-2 pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => handleMarkDose(dose.id, 'TAKEN')}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 rounded-xl flex items-center justify-center space-x-1.5 shadow-lg shadow-emerald-600/20 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark Taken</span>
                    </button>
                    <button
                      onClick={() => handleMarkDose(dose.id, 'SKIPPED')}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl text-xs transition-all"
                    >
                      Skip
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleMarkDose(dose.id, 'PENDING')}
                    className="text-[10px] text-slate-500 hover:text-slate-300 text-center block pt-1"
                  >
                    Undo Status
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: UPCOMING APPOINTMENTS */}
      {activeTab === 'appointments' && (
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Scheduled Tele-Consultation</h3>

          <div className="bg-gradient-to-br from-indigo-950/40 via-slate-950 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-3xl">
                {MOCK_UPCOMING_APPOINTMENT.photo}
              </div>
              <div>
                <div className="inline-flex items-center space-x-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full mb-1">
                  <Clock className="w-3.5 h-3.5 animate-pulse" />
                  <span>Starting in 15 Mins</span>
                </div>
                <h4 className="text-lg font-bold text-white">{MOCK_UPCOMING_APPOINTMENT.doctorName}</h4>
                <p className="text-xs text-slate-400">{MOCK_UPCOMING_APPOINTMENT.specialty}</p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">{MOCK_UPCOMING_APPOINTMENT.slotTime}</p>
              </div>
            </div>

            <a
              href={MOCK_UPCOMING_APPOINTMENT.meetLink}
              target="_blank"
              rel="noreferrer"
              className="w-full md:w-auto bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold text-xs px-6 py-3.5 rounded-2xl shadow-xl shadow-indigo-500/20 flex items-center justify-center space-x-2 transition-all"
            >
              <Video className="w-4 h-4" />
              <span>Join Video Consult</span>
            </a>
          </div>
        </div>
      )}

      {/* TAB 3: TREATMENT PLAN ESCROW PROGRESS & DOCTOR HEALTH REPORTS */}
      {activeTab === 'treatment' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Days Completed Card */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
              <div className="text-xs text-slate-400 font-medium">Treatment Progress</div>
              <div className="text-2xl font-bold text-white mt-1">
                Day {treatmentDaysCompleted} <span className="text-xs font-normal text-slate-400">of {treatmentDaysTotal} Days</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>

            {/* Daily Payout Rate */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
              <div className="text-xs text-slate-400 font-medium">Daily Escrow Payout Rate</div>
              <div className="text-2xl font-bold text-slate-200 mt-1 font-mono">
                ₹{dailyRate.toLocaleString('en-IN')}<span className="text-xs font-normal text-slate-400">/day</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-2">Released upon daily check-in</div>
            </div>

            {/* Remaining Escrow Balance */}
            <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-4">
              <div className="text-xs text-emerald-400 font-semibold">Remaining Escrow Balance</div>
              <div className="text-2xl font-bold text-emerald-300 mt-1 font-mono">
                ₹{escrowRemaining.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-emerald-400/70 mt-2">100% Protected in Escrow</div>
            </div>
          </div>

          {/* DOCTOR GENERATED PATIENT HEALTH REPORTS SECTION */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-teal-400" />
                  <span>Doctor Generated Health & Diagnostic Reports</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Clinical notes, AI scan assessments, and doctor-approved health summaries</p>
              </div>

              <span className="px-2.5 py-1 bg-teal-950 text-teal-300 border border-teal-800 text-[10px] font-mono font-bold rounded-full">
                {MOCK_DOCTOR_HEALTH_REPORTS.length} REPORTS ON FILE
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MOCK_DOCTOR_HEALTH_REPORTS.map((rep) => (
                <div
                  key={rep.id}
                  className="bg-slate-950/80 border border-slate-800 hover:border-teal-500/40 rounded-2xl p-5 space-y-3 transition-all flex flex-col justify-between shadow-xl"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${rep.badgeColor}`}>
                        {rep.badge}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{rep.date}</span>
                    </div>

                    <h4 className="text-xs font-bold text-white leading-snug">{rep.title}</h4>
                    <p className="text-[10px] text-indigo-400 font-medium">By {rep.doctorName} ({rep.doctorRole})</p>
                    <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                      {rep.summary}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] text-slate-400 font-mono">Encrypted Clinical Record</span>
                    <button
                      onClick={() => setSelectedReportModal(rep)}
                      className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold text-[11px] rounded-xl flex items-center space-x-1.5 transition-all shadow-md"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Full Report</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FULL REPORT MODAL PREVIEW */}
      {selectedReportModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-teal-500/40 rounded-3xl p-6 md:p-8 max-w-xl w-full space-y-5 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setSelectedReportModal(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-800 pb-4">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border inline-block mb-2 ${selectedReportModal.badgeColor}`}>
                {selectedReportModal.badge}
              </span>
              <h3 className="text-lg font-extrabold text-white">{selectedReportModal.title}</h3>
              <p className="text-xs text-indigo-400 font-medium">Attending Specialist: {selectedReportModal.doctorName} • {selectedReportModal.date}</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold">Clinical Assessment Summary</span>
                <p className="text-slate-200 leading-relaxed">{selectedReportModal.summary}</p>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-[10px] font-mono text-teal-400 uppercase block font-bold">Report Vitals & Measurements</span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {Object.entries(selectedReportModal.vitals).map(([k, v]) => (
                    <div key={k} className="p-2 bg-slate-900/80 rounded-xl border border-slate-800">
                      <span className="text-[9px] text-slate-400 uppercase block font-mono">{k.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="font-bold text-white">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end space-x-3">
              <button
                onClick={() => setSelectedReportModal(null)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all"
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

