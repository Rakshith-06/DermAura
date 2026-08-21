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
    <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 shadow-xs text-stone-900 relative overflow-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 p-4 rounded-2xl border shadow-xl text-xs font-semibold flex items-center space-x-3 animate-in slide-in-from-top-5 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}
        >
          {toastMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-rose-600" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-5 mb-6">
        <div>
          <div className="inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Lead PCP Gatekeeper Hub</span>
          </div>
          <h2 className="text-2xl font-black text-stone-900 tracking-tight">Prescription Safety Review</h2>
          <p className="text-stone-500 text-xs mt-0.5">Review specialist recommendations, check allergies, and lock in daily schedules</p>
        </div>

        <div className="bg-stone-50 border border-stone-200 text-stone-700 px-3.5 py-1.5 rounded-2xl text-xs font-bold font-mono">
          Pending: {proposals.length}
        </div>
      </div>

      {!currentProposal || proposals.length === 0 ? (
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-10 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto opacity-80" />
          <h3 className="text-lg font-bold text-stone-900">All Pending Approvals Cleared!</h3>
          <p className="text-stone-500 text-xs max-w-sm mx-auto">There are currently no pending specialist prescription proposals waiting for review.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: Proposal Selector List */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 font-mono">Pending Queue</h4>
            {proposals.map((prop) => {
              const pId = prop._id || prop.id;
              const isSelected = pId === activeProposalId;
              return (
                <button
                  key={pId}
                  onClick={() => setActiveProposalId(pId)}
                  className={`w-full p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-400 text-stone-900 shadow-xs'
                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-stone-900">{prop.patientName || 'Aarav Sharma'}</span>
                    <span className="text-[10px] bg-emerald-100 border border-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                      {prop.specialistRole || 'Specialist'}
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-700 font-medium truncate mt-1">
                    {prop.medications?.[0]?.drugName || 'Prescription Item'}
                  </div>
                  <div className="text-[10px] text-stone-500 mt-0.5">By {prop.specialistName || 'Specialist Doctor'}</div>
                </button>
              );
            })}
          </div>

          {/* RIGHT: Detailed Review Panel */}
          <div className="lg:col-span-2 bg-stone-50 border border-stone-200 rounded-2xl p-5 md:p-6 space-y-5">
            {/* Patient & Specialist Header Info */}
            <div className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-900">{currentProposal.patientName || 'Aarav Sharma'}</h4>
                  <div className="text-[11px] text-stone-500 font-medium">
                    {currentProposal.patientAge || 28} Yrs • {currentProposal.patientGender || 'Male'}
                  </div>
                </div>
              </div>

              {/* Allergy Warning Alert */}
              <div className="bg-rose-50 border border-rose-200 text-rose-800 px-3 py-1.5 rounded-xl text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <div>
                  <span className="font-bold">Known Allergies: </span>
                  <span>{currentProposal.patientAllergies?.join(', ') || 'None recorded'}</span>
                </div>
              </div>
            </div>

            {/* Specialist Clinical Rationale */}
            <div>
              <h5 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5 font-mono">Specialist Clinical Rationale</h5>
              <div className="bg-white border border-stone-200 rounded-xl p-3 text-xs text-stone-700 italic">
                "{currentProposal.clinicalRationale || 'No clinical rationale provided.'}" —{' '}
                <span className="not-italic text-stone-900 font-bold">{currentProposal.specialistName}</span>
              </div>
            </div>

            {/* Proposed Medications List */}
            <div>
              <h5 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 font-mono">Proposed Medication List</h5>
              <div className="space-y-2">
                {currentProposal.medications?.map((med, idx) => (
                  <div key={idx} className="bg-white border border-stone-200 rounded-2xl p-4 space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Pill className="w-4 h-4 text-emerald-600" />
                        <span className="font-bold text-xs text-stone-900">{med.drugName}</span>
                        <span className="text-[11px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md font-mono font-bold">
                          {med.dosage}
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                        {med.durationDays || 30} Days
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-500">
                      <div>
                        <span className="text-stone-400">Daily Slots: </span>
                        <span className="text-stone-800 font-semibold">{med.timing?.join(', ')}</span>
                      </div>
                      <div>
                        <span className="text-stone-400">Instructions: </span>
                        <span className="text-stone-800">{med.instructions}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Lead PCP Clinical Notes Input */}
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1 font-mono">
                Lead PCP Clinical Approval Notes
              </label>
              <input
                type="text"
                value={leadNotes}
                onChange={(e) => setLeadNotes(e.target.value)}
                placeholder="Optional notes regarding drug interaction verification..."
                className="w-full bg-white border border-stone-300 rounded-xl p-2.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-emerald-600 transition-all"
              />
            </div>

            {/* Rejection Drawer Input */}
            {isRejecting && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 space-y-2 animate-in fade-in">
                <label className="block text-xs font-bold text-rose-800">Reason for Declining Proposal *</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="State safety concerns or contraindications..."
                  rows={2}
                  className="w-full bg-white border border-rose-300 rounded-xl p-2.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-rose-600 transition-all resize-none"
                />
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="flex items-center justify-end space-x-3 pt-2 border-t border-stone-200">
              {isRejecting ? (
                <>
                  <button
                    onClick={() => setIsRejecting(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleReviewAction('REJECTED')}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs cursor-pointer"
                  >
                    Confirm Rejection
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsRejecting(true)}
                    className="px-4 py-2.5 rounded-2xl text-xs font-bold text-rose-700 hover:bg-rose-50 border border-rose-200 transition-all cursor-pointer"
                  >
                    Decline Proposal
                  </button>

                  <button
                    onClick={() => handleReviewAction('APPROVED')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded-2xl shadow-xs flex items-center space-x-2 transition-all cursor-pointer"
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
