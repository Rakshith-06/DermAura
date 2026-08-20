import React, { useState, useEffect } from 'react';
import { API_BASE } from '../api.js';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Pill,
  FileText,
  Lock,
  Calendar,
  Sparkles,
  ChevronRight
} from 'lucide-react';

const MOCK_PENDING_PROPOSALS = [
  {
    _id: 'rx-prop-101',
    id: 'rx-prop-101',
    patientName: 'Aarav Sharma',
    patientAge: 28,
    patientGender: 'Male',
    patientAllergies: ['Penicillin', 'Sulfa Drugs'],
    currentActiveMeds: ['Salicylic Acid 2% Cleanser'],
    specialistName: 'Dr. Vikramaditya Sen',
    specialistRole: 'Trichologist',
    medications: [
      {
        drugName: 'Minoxidil 5% Topical Solution',
        dosage: '1ml twice daily',
        timing: ['Morning', 'Night'],
        durationDays: 30,
        instructions: 'Apply 1ml directly to dry scalp area twice daily.',
        isGatedProduct: true,
      },
    ],
    clinicalRationale: 'Patient presenting with early stage male pattern alopecia hair thinning.',
    createdAt: new Date().toISOString(),
  },
];

export default function LeadDoctorApprovalPanel({
  leadDoctorId = 'doc-sarah-jenkins',
  onApproveSuccess = () => {},
}) {
  const [proposals, setProposals] = useState(MOCK_PENDING_PROPOSALS);
  const [loading, setLoading] = useState(false);
  const [activeProposalId, setActiveProposalId] = useState(proposals[0]?._id);
  const [leadNotes, setLeadNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchPendingProposals = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/prescriptions/pending?leadDoctorId=${leadDoctorId}`);
      const data = await response.json();
      if (data.success && Array.isArray(data.pendingPrescriptions) && data.pendingPrescriptions.length > 0) {
        setProposals(data.pendingPrescriptions);
        setActiveProposalId(data.pendingPrescriptions[0]._id || data.pendingPrescriptions[0].id);
      }
    } catch (e) {
      // Keep mock fallback data for demo mode
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingProposals();
  }, [leadDoctorId]);

  const currentProposal = proposals.find((p) => (p._id || p.id) === activeProposalId) || proposals[0];

  const handleReviewAction = async (action) => {
    if (!currentProposal) return;
    const propId = currentProposal._id || currentProposal.id;

    if (action === 'REJECTED' && !rejectionReason.trim()) {
      alert('Please state a reason for rejecting this prescription proposal.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/prescriptions/${propId}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          leadDoctorId,
          leadDoctorNotes: leadNotes,
          rejectionReason,
        }),
      });
      const data = await response.json();
    } catch (e) {}

    // Update local UI state
    setProposals((prev) => prev.filter((p) => (p._id || p.id) !== propId));
    setToastMessage({
      type: action === 'APPROVED' ? 'success' : 'error',
      text: action === 'APPROVED'
        ? `Prescription approved! Medication schedule locked & product unlocked for ${currentProposal?.patientName || 'patient'}.`
        : `Prescription proposal declined. Rationale logged for patient.`,
    });

    setIsRejecting(false);
    setRejectionReason('');
    setLeadNotes('');

    onApproveSuccess(propId, action);

    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl text-slate-100 relative overflow-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 p-4 rounded-2xl border shadow-2xl text-xs font-semibold flex items-center space-x-3 animate-in slide-in-from-top-5 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950 border-rose-500/40 text-rose-300'
          }`}
        >
          {toastMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertTriangle className="w-5 h-5 text-rose-400" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-5 mb-6">
        <div>
          <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Lead PCP Gatekeeper Hub</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Prescription Safety Review</h2>
          <p className="text-slate-400 text-xs mt-0.5">Review specialist recommendations, check allergies, and lock in daily schedules</p>
        </div>

        <div className="bg-slate-950 border border-slate-800 text-slate-300 px-3.5 py-1.5 rounded-2xl text-xs font-bold font-mono">
          Pending: {proposals.length}
        </div>
      </div>

      {!currentProposal || proposals.length === 0 ? (
        <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-10 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto opacity-80" />
          <h3 className="text-lg font-bold text-white">All Pending Approvals Cleared!</h3>
          <p className="text-slate-400 text-xs max-w-sm mx-auto">There are currently no pending specialist prescription proposals waiting for review.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: Proposal Selector List */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Pending Queue</h4>
            {proposals.map((prop) => {
              const pId = prop._id || prop.id;
              const isSelected = pId === activeProposalId;
              return (
                <button
                  key={pId}
                  onClick={() => setActiveProposalId(pId)}
                  className={`w-full p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/60 text-white shadow-lg'
                      : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">{prop.patientName || 'Aarav Sharma'}</span>
                    <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full font-medium">
                      {prop.specialistRole || 'Specialist'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 font-medium truncate mt-1">
                    {prop.medications?.[0]?.drugName || 'Prescription Item'}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">By {prop.specialistName || 'Specialist Doctor'}</div>
                </button>
              );
            })}
          </div>

          {/* RIGHT: Detailed Review Panel */}
          <div className="lg:col-span-2 bg-slate-950/60 border border-slate-800 rounded-2xl p-5 md:p-6 space-y-5">
            {/* Patient & Specialist Header Info */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{currentProposal.patientName || 'Aarav Sharma'}</h4>
                  <div className="text-[11px] text-slate-400">
                    {currentProposal.patientAge || 28} Yrs • {currentProposal.patientGender || 'Male'}
                  </div>
                </div>
              </div>

              {/* Allergy Warning Alert */}
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-3 py-1.5 rounded-xl text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <div>
                  <span className="font-bold">Known Allergies: </span>
                  <span>{currentProposal.patientAllergies?.join(', ') || 'None recorded'}</span>
                </div>
              </div>
            </div>

            {/* Specialist Clinical Rationale */}
            <div>
              <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Specialist Clinical Rationale</h5>
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 italic">
                "{currentProposal.clinicalRationale || 'No clinical rationale provided.'}" —{' '}
                <span className="not-italic text-slate-400 font-semibold">{currentProposal.specialistName}</span>
              </div>
            </div>

            {/* Proposed Medications List */}
            <div>
              <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Proposed Medication List</h5>
              <div className="space-y-2">
                {currentProposal.medications?.map((med, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Pill className="w-4 h-4 text-amber-400" />
                        <span className="font-bold text-xs text-white">{med.drugName}</span>
                        <span className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-mono">
                          {med.dosage}
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
                        {med.durationDays || 30} Days
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                      <div>
                        <span className="text-slate-500">Daily Slots: </span>
                        <span className="text-slate-200 font-semibold">{med.timing?.join(', ')}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Instructions: </span>
                        <span className="text-slate-200">{med.instructions}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Lead PCP Clinical Notes Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Lead PCP Clinical Approval Notes
              </label>
              <input
                type="text"
                value={leadNotes}
                onChange={(e) => setLeadNotes(e.target.value)}
                placeholder="Optional notes regarding drug interaction verification..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
              />
            </div>

            {/* Rejection Drawer Input */}
            {isRejecting && (
              <div className="bg-rose-950/40 border border-rose-500/30 rounded-xl p-3.5 space-y-2 animate-in fade-in">
                <label className="block text-xs font-bold text-rose-300">Reason for Declining Proposal *</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="State safety concerns or contraindications..."
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-all resize-none"
                />
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-800">
              {isRejecting ? (
                <>
                  <button
                    onClick={() => setIsRejecting(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleReviewAction('REJECTED')}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-rose-600/20"
                  >
                    Confirm Rejection
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsRejecting(true)}
                    className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-all"
                  >
                    Decline Proposal
                  </button>

                  <button
                    onClick={() => handleReviewAction('APPROVED')}
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-slate-950 font-bold text-xs px-6 py-2.5 rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center space-x-2 transition-all"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Approve & Lock in Schedule</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
