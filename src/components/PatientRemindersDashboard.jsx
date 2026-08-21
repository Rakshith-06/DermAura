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
    <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 shadow-sm text-stone-900 relative overflow-hidden">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-2xl shadow-xl text-xs font-semibold flex items-center space-x-3 animate-in slide-in-from-top-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Tabs */}
      <div className="flex flex-wrap items-center justify-between border-b border-stone-200 pb-5 mb-6 gap-3">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 tracking-tight">Patient Care Portal</h2>
          <p className="text-stone-500 text-xs mt-0.5">Daily adherence tracker, scheduled tele-consultations, treatment escrow & doctor health reports</p>
        </div>

        {/* Tab Buttons */}
        <div className="bg-stone-50 p-1.5 rounded-2xl border border-stone-200 flex items-center space-x-1">
          <button
            onClick={() => setActiveTab('doses')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'doses'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Today's Doses
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'appointments'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Appointments
          </button>
          <button
            onClick={() => setActiveTab('treatment')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'treatment'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
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
            <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Scheduled Doses ({doses.filter((d) => d.status === 'TAKEN').length}/{doses.length} Completed)
            </h3>
            <span className="text-xs text-emerald-700 font-medium">Daily Goal: 100%</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {doses.map((dose) => (
              <div
                key={dose.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 relative overflow-hidden ${
                  dose.status === 'TAKEN'
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : dose.status === 'SKIPPED'
                    ? 'bg-stone-50 border-stone-200 opacity-60'
                    : 'bg-white border-stone-200 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full font-mono ${
                        dose.timeOfDay === 'Morning'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : dose.timeOfDay === 'Afternoon'
                          ? 'bg-sky-50 text-sky-800 border border-sky-200'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {dose.timeOfDay} ({dose.scheduledTime})
                    </span>

                    {dose.status === 'TAKEN' && (
                      <span className="text-emerald-700 text-xs font-bold flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>TAKEN</span>
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-sm text-stone-900">{dose.drugName}</h4>
                  <div className="text-xs text-emerald-700 font-mono mt-0.5">{dose.dosage}</div>
                  <p className="text-[11px] text-stone-500 mt-2 italic">{dose.instructions}</p>
                </div>

                {/* ONE-TAP ACTION BUTTONS */}
                {dose.status !== 'TAKEN' ? (
                  <div className="flex items-center space-x-2 pt-2 border-t border-stone-200">
                    <button
                      onClick={() => handleMarkDose(dose.id, 'TAKEN')}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 rounded-xl flex items-center justify-center space-x-1.5 shadow-2xs transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark Taken</span>
                    </button>
                    <button
                      onClick={() => handleMarkDose(dose.id, 'SKIPPED')}
                      className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 rounded-xl text-xs transition-all cursor-pointer"
                    >
                      Skip
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleMarkDose(dose.id, 'PENDING')}
                    className="text-[10px] text-stone-400 hover:text-stone-600 text-center block pt-1 cursor-pointer"
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
          <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Scheduled Tele-Consultation</h3>

          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-white border border-stone-200 flex items-center justify-center text-3xl shadow-2xs">
                {MOCK_UPCOMING_APPOINTMENT.photo}
              </div>
              <div>
                <div className="inline-flex items-center space-x-1.5 text-xs text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full mb-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                  <span>Starting in 15 Mins</span>
                </div>
                <h4 className="text-lg font-bold text-stone-900">{MOCK_UPCOMING_APPOINTMENT.doctorName}</h4>
                <p className="text-xs text-stone-500">{MOCK_UPCOMING_APPOINTMENT.specialty}</p>
                <p className="text-[11px] text-stone-400 font-mono mt-0.5">{MOCK_UPCOMING_APPOINTMENT.slotTime}</p>
              </div>
            </div>

            <a
              href={MOCK_UPCOMING_APPOINTMENT.meetLink}
              target="_blank"
              rel="noreferrer"
              className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-3.5 rounded-2xl shadow-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
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
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4">
              <div className="text-xs text-stone-500 font-medium">Treatment Progress</div>
              <div className="text-2xl font-bold text-stone-900 mt-1">
                Day {treatmentDaysCompleted} <span className="text-xs font-normal text-stone-400">of {treatmentDaysTotal} Days</span>
              </div>
              <div className="w-full bg-stone-200 h-2 rounded-full mt-3 overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>

            {/* Daily Payout Rate */}
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4">
              <div className="text-xs text-stone-500 font-medium">Daily Escrow Payout Rate</div>
              <div className="text-2xl font-bold text-stone-900 mt-1 font-mono">
                ₹{dailyRate.toLocaleString('en-IN')}<span className="text-xs font-normal text-stone-400">/day</span>
              </div>
              <div className="text-[10px] text-stone-400 mt-2">Released upon daily check-in</div>
            </div>

            {/* Remaining Escrow Balance */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
              <div className="text-xs text-emerald-800 font-semibold">Remaining Escrow Balance</div>
              <div className="text-2xl font-bold text-emerald-700 mt-1 font-mono">
                ₹{escrowRemaining.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-emerald-800/70 mt-2">100% Protected in Escrow</div>
            </div>
          </div>

          {/* DOCTOR GENERATED PATIENT HEALTH REPORTS SECTION */}
          <div className="space-y-4 pt-4 border-t border-stone-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-stone-900 flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>Doctor Generated Health & Diagnostic Reports</span>
                </h3>
                <p className="text-[11px] text-stone-500 mt-0.5">Clinical notes, AI scan assessments, and doctor-approved health summaries</p>
              </div>

              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono font-bold rounded-full">
                {MOCK_DOCTOR_HEALTH_REPORTS.length} REPORTS ON FILE
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MOCK_DOCTOR_HEALTH_REPORTS.map((rep) => (
                <div
                  key={rep.id}
                  className="bg-white border border-stone-200 hover:border-emerald-400 rounded-2xl p-5 space-y-3 transition-all flex flex-col justify-between shadow-xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border bg-emerald-50 text-emerald-800 border-emerald-200">
                        {rep.badge}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">{rep.date}</span>
                    </div>

                    <h4 className="text-xs font-bold text-stone-900 leading-snug">{rep.title}</h4>
                    <p className="text-[10px] text-emerald-700 font-medium">By {rep.doctorName} ({rep.doctorRole})</p>
                    <p className="text-[11px] text-stone-600 leading-relaxed bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                      {rep.summary}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-stone-200">
                    <span className="text-[10px] text-stone-400 font-mono">Encrypted Clinical Record</span>
                    <button
                      onClick={() => setSelectedReportModal(rep)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs"
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
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 max-w-xl w-full space-y-5 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setSelectedReportModal(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-stone-200 pb-4">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border inline-block mb-2 bg-emerald-50 text-emerald-800 border-emerald-200">
                {selectedReportModal.badge}
              </span>
              <h3 className="text-lg font-extrabold text-stone-900">{selectedReportModal.title}</h3>
              <p className="text-xs text-emerald-700 font-medium">Attending Specialist: {selectedReportModal.doctorName} • {selectedReportModal.date}</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                <span className="text-[10px] font-mono text-stone-500 uppercase block font-bold">Clinical Assessment Summary</span>
                <p className="text-stone-700 leading-relaxed">{selectedReportModal.summary}</p>
              </div>

              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                <span className="text-[10px] font-mono text-emerald-800 uppercase block font-bold">Report Vitals & Measurements</span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {Object.entries(selectedReportModal.vitals).map(([k, v]) => (
                    <div key={k} className="p-2 bg-white rounded-xl border border-stone-200">
                      <span className="text-[9px] text-stone-500 uppercase block font-mono">{k.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="font-bold text-stone-900">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end space-x-3">
              <button
                onClick={() => setSelectedReportModal(null)}
                className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl transition-all cursor-pointer"
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

