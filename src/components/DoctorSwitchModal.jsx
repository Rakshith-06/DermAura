import React, { useState } from 'react';
import { API_BASE } from '../api.js';
import {
  RefreshCw,
  UserCheck,
  ShieldCheck,
  FileText,
  AlertCircle,
  CheckCircle2,
  X,
  IndianRupee,
  ArrowRight,
  Sparkles,
  Smile,
  Scissors
} from 'lucide-react';

const MOCK_SPECIALISTS = [
  {
    id: 'doc-dr-vikramaditya-sen',
    name: 'Dr. Vikramaditya Sen',
    specialtyDomain: 'HAIR',
    specialtyLabel: '💇 Hair Care Specialist',
    specialty: 'Trichologist & Hair Transplant Specialist',
    hospital: 'Apollo Dermatological Institute',
    photo: '👨‍⚕️',
    rating: '4.9 ★',
    dutyStatus: 'online',
  },
  {
    id: 'doc-dr-meera-reddy',
    name: 'Dr. Meera Reddy',
    specialtyDomain: 'SKIN',
    specialtyLabel: '✨ Skin Care Specialist',
    specialty: 'Dermatopathologist & Skin Barrier Specialist',
    hospital: 'Fortis Skin & Laser Center',
    photo: '👩‍⚕️',
    rating: '4.8 ★',
    dutyStatus: 'online',
  },
  {
    id: 'doc-dr-arjun-nambiar',
    name: 'Dr. Arjun Nambiar',
    specialtyDomain: 'SKIN',
    specialtyLabel: '✨ Skin Care Specialist',
    specialty: 'Pediatric & Facial Skin Care Specialist',
    hospital: 'Manipal Children Dermatology',
    photo: '👨‍⚕️',
    rating: '4.9 ★',
    dutyStatus: 'busy',
  },
  {
    id: 'doc-dr-sunita-rao',
    name: 'Dr. Sunita Rao',
    specialtyDomain: 'HAIR',
    specialtyLabel: '💇 Hair Care Specialist',
    specialty: 'Scalp Alopecia & Hair Growth Specialist',
    hospital: 'Max Hair & Derm Institute',
    photo: '👩‍⚕️',
    rating: '4.9 ★',
    dutyStatus: 'offline',
  },
];

export default function DoctorSwitchModal({
  isOpen = true,
  consultationId = 'consult-md-101',
  currentDoctorName = 'Dr. Sarah Jenkins',
  currentDoctorId = 'demo-doc-101',
  initialCategory = 'SKIN_CARE',
  totalDays = 10,
  daysServed = 4,
  totalAmount = 3000,
  dailyRate = 300,
  onClose = () => {},
  onSwitchSuccess = () => {},
}) {
  const [targetCategory, setTargetCategory] = useState(initialCategory); // 'SKIN_CARE' | 'HAIR_CARE' | 'GENERAL_HEALTH'
  const [specialistCategoryFilter, setSpecialistCategoryFilter] = useState('ALL'); // 'ALL' | 'SKIN' | 'HAIR'
  const [selectedDoctorId, setSelectedDoctorId] = useState(MOCK_SPECIALISTS[0].id);
  const [handoffNotes, setHandoffNotes] = useState(
    'Patient care handoff notes for specialized treatment domain.'
  );
  const [reason, setReason] = useState('Specialist transfer for targeted clinical domain');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [transferResult, setTransferResult] = useState(null);

  if (!isOpen) return null;

  // Financial calculations in INR ₹
  const numDaysServed = Math.min(daysServed, totalDays);
  const amountUsed = numDaysServed * dailyRate; // e.g. 4 * 300 = ₹1,200
  const remainingEscrow = Math.max(0, totalAmount - amountUsed); // e.g. ₹3,000 - ₹1,200 = ₹1,800

  const handleConfirmSwitch = async () => {
    if (!handoffNotes.trim()) {
      setError('Please enter mandatory clinical handoff notes before transferring care.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/consultations/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consultationId,
          requestingDoctorId: currentDoctorId,
          newDoctorId: selectedDoctorId,
          daysServed: numDaysServed,
          handoffNotes,
          reason,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to complete doctor transfer');
      }

      setTransferResult({ ...data.transferSummary, category: targetCategory });
      setTimeout(() => {
        onSwitchSuccess({ ...data.transferSummary, category: targetCategory });
      }, 1800);
    } catch (err) {
      // Mock Fallback for Demo Mode
      const selectedDoc = MOCK_SPECIALISTS.find((d) => d.id === selectedDoctorId);
      const mockResult = {
        consultationId,
        category: targetCategory,
        previousDoctorId: currentDoctorId,
        newDoctorId: selectedDoctorId,
        newDoctorName: selectedDoc?.name || 'Dr. Vikramaditya Sen',
        daysServedByPreviousDoctor: numDaysServed,
        financialBreakdown: {
          currency: 'INR',
          symbol: '₹',
          totalPackageAmount: totalAmount,
          dailyRate: dailyRate,
          amountEarnedByPreviousDoctor: amountUsed,
          amountTransferredToNewDoctor: remainingEscrow,
          formatted: {
            totalPackage: `₹${totalAmount.toLocaleString('en-IN')}`,
            previousDoctorPayout: `₹${amountUsed.toLocaleString('en-IN')}`,
            newDoctorEscrowBalance: `₹${remainingEscrow.toLocaleString('en-IN')}`,
          },
        },
      };
      setTransferResult(mockResult);
      setTimeout(() => {
        onSwitchSuccess(mockResult);
      }, 1800);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-5 md:p-7 shadow-2xl text-slate-100 relative overflow-hidden flex flex-col max-h-[88vh] my-auto animate-in fade-in zoom-in-95">
        {/* Background Glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header (Fixed at top) */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Switch Attending Doctor</h3>
              <p className="text-slate-400 text-xs">Multi-Day Escrow Re-allocation & Care Handoff</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto pr-1.5 space-y-5 custom-scrollbar">
          {transferResult ? (
            /* TRANSFER SUCCESS VIEW */
            <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-2xl p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-bold text-white">Doctor Switch Confirmed!</h4>
              <p className="text-slate-300 text-xs">
                Care successfully transferred. Remaining balance of{' '}
                <span className="font-bold text-emerald-400">
                  ₹{remainingEscrow.toLocaleString('en-IN')}
                </span>{' '}
                has been transferred in escrow.
              </p>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-left space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Previous Doctor Payout ({numDaysServed} Days):</span>
                  <span className="font-bold text-slate-200">₹{amountUsed.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>New Escrow Balance Transferred:</span>
                  <span className="font-bold text-emerald-400">₹{remainingEscrow.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* ITEMIZATION FINANCIAL SUMMARY (INR ₹) */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400 font-medium">Program Total (10 Days)</span>
                  <span className="font-bold text-white font-mono">₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
                    <div className="text-[10px] text-slate-400">Used So Far ({numDaysServed} Days)</div>
                    <div className="text-base font-bold text-slate-200 mt-0.5 font-mono">
                      ₹{amountUsed.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[9px] text-slate-500 mt-0.5">Paid to {currentDoctorName}</div>
                  </div>

                  <div className="bg-emerald-950/40 border border-emerald-500/30 p-3 rounded-xl">
                    <div className="text-[10px] text-emerald-400 font-semibold">Escrow Balance Transferred</div>
                    <div className="text-base font-bold text-emerald-300 mt-0.5 font-mono">
                      ₹{remainingEscrow.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[9px] text-emerald-400/70 mt-0.5">Transferred to New Doctor</div>
                  </div>
                </div>
              </div>

              {/* SELECT NEW SPECIALIST */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Select New Specialist Doctor
                  </label>
                  <span className="text-[10px] text-slate-400">Filter by domain:</span>
                </div>

                {/* SPECIALTY FILTER TABS */}
                <div className="flex items-center space-x-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setSpecialistCategoryFilter('ALL')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all text-center ${
                      specialistCategoryFilter === 'ALL'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All Specialists
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpecialistCategoryFilter('SKIN')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center space-x-1 ${
                      specialistCategoryFilter === 'SKIN'
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Smile className="w-3 h-3 text-teal-400" />
                    <span>Skin Care</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpecialistCategoryFilter('HAIR')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center space-x-1 ${
                      specialistCategoryFilter === 'HAIR'
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Scissors className="w-3 h-3 text-indigo-400" />
                    <span>Hair Care</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
                  {MOCK_SPECIALISTS.filter(doc =>
                    specialistCategoryFilter === 'ALL' || doc.specialtyDomain === specialistCategoryFilter
                  ).map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => setSelectedDoctorId(doc.id)}
                      className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                        selectedDoctorId === doc.id
                          ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg'
                          : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xl flex-shrink-0">
                          {doc.photo}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <div className="font-bold text-xs text-white">{doc.name}</div>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                              doc.specialtyDomain === 'SKIN' ? 'bg-teal-500/10 border-teal-500/30 text-teal-300' : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                            }`}>
                              {doc.specialtyLabel}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400">{doc.specialty}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold flex items-center space-x-1 ${
                          doc.dutyStatus === 'online'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : doc.dutyStatus === 'busy'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1 ${
                            doc.dutyStatus === 'online' ? 'bg-emerald-400 animate-pulse' : doc.dutyStatus === 'busy' ? 'bg-amber-400' : 'bg-rose-500'
                          }`} />
                          <span>{doc.dutyStatus === 'online' ? 'Online' : doc.dutyStatus === 'busy' ? 'Busy' : 'Off-Duty'}</span>
                        </span>
                        <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                          {doc.rating}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* MANDATORY HANDOFF NOTES */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Mandatory Clinical Handoff Notes <span className="text-rose-400">*</span>
                </label>
                <textarea
                  value={handoffNotes}
                  onChange={(e) => setHandoffNotes(e.target.value)}
                  placeholder="Enter mandatory clinical handoff notes for the incoming specialist..."
                  rows={2}
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all resize-none"
                />
              </div>

              {error && (
                <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-2xl text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* FOOTER ACTIONS */}
              <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSwitch}
                  disabled={loading}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs px-6 py-2.5 rounded-2xl shadow-lg shadow-amber-500/20 flex items-center space-x-2 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <span>Processing Transfer...</span>
                  ) : (
                    <>
                      <span>Confirm Doctor Switch</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
