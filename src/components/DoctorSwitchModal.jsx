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
  const [targetCategory, setTargetCategory] = useState(initialCategory);
  const [specialistCategoryFilter, setSpecialistCategoryFilter] = useState('ALL');
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
  const amountUsed = numDaysServed * dailyRate;
  const remainingEscrow = Math.max(0, totalAmount - amountUsed);

  const handleConfirmSwitch = async () => {
    if (!handoffNotes.trim()) {
      setError('Please enter mandatory clinical handoff notes before transferring care.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const selectedDoc = MOCK_SPECIALISTS.find((d) => d.id === selectedDoctorId);
      const res = await fetch(`${API_BASE}/api/consultations/${consultationId}/switch-doctor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('dermaura_token') || ''}`,
        },
        body: JSON.stringify({
          newDoctorId: selectedDoctorId,
          newDoctorName: selectedDoc?.name,
          category: targetCategory,
          reason,
          handoffNotes,
          daysServed: numDaysServed,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
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
    <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-sans">
      <div className="bg-white border border-stone-200 rounded-3xl max-w-xl w-full p-5 md:p-7 shadow-2xl text-stone-900 relative overflow-hidden flex flex-col max-h-[88vh] my-auto animate-in fade-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-stone-200 pb-4 mb-4 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-stone-900">Switch Attending Doctor</h3>
              <p className="text-stone-500 text-xs">Multi-Day Escrow Re-allocation & Care Handoff</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto pr-1.5 space-y-5 custom-scrollbar">
          {transferResult ? (
            /* TRANSFER SUCCESS VIEW */
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-700 border border-emerald-300">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-bold text-stone-900">Doctor Switch Confirmed!</h4>
              <p className="text-stone-600 text-xs">
                Care successfully transferred. Remaining balance of{' '}
                <span className="font-bold text-emerald-800">
                  ₹{remainingEscrow.toLocaleString('en-IN')}
                </span>{' '}
                has been transferred in escrow.
              </p>

              <div className="bg-white border border-stone-200 rounded-xl p-4 text-left space-y-2 text-xs">
                <div className="flex justify-between text-stone-500">
                  <span>Previous Doctor Payout ({numDaysServed} Days):</span>
                  <span className="font-bold text-stone-800">₹{amountUsed.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>New Escrow Balance Transferred:</span>
                  <span className="font-bold text-emerald-800">₹{remainingEscrow.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Financial Summary */}
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs border-b border-stone-200 pb-2">
                  <span className="text-stone-500 font-medium">Program Total (10 Days)</span>
                  <span className="font-bold text-stone-900 font-mono">₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white border border-stone-200 p-3 rounded-xl">
                    <div className="text-[10px] text-stone-500">Used So Far ({numDaysServed} Days)</div>
                    <div className="text-base font-bold text-stone-800 mt-0.5 font-mono">
                      ₹{amountUsed.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[9px] text-stone-400 mt-0.5">Paid to {currentDoctorName}</div>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
                    <div className="text-[10px] text-emerald-800 font-semibold">Escrow Balance Transferred</div>
                    <div className="text-base font-bold text-emerald-900 mt-0.5 font-mono">
                      ₹{remainingEscrow.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[9px] text-emerald-700 mt-0.5">Transferred to New Doctor</div>
                  </div>
                </div>
              </div>

              {/* Select New Specialist */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
                    Select New Specialist Doctor
                  </label>
                  <span className="text-[10px] text-stone-400">Filter by domain:</span>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center space-x-1.5 bg-stone-100 p-1 rounded-xl border border-stone-200">
                  <button
                    type="button"
                    onClick={() => setSpecialistCategoryFilter('ALL')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all text-center cursor-pointer ${
                      specialistCategoryFilter === 'ALL'
                        ? 'bg-white text-stone-900 shadow-2xs border border-stone-200'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    All Specialists
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpecialistCategoryFilter('SKIN')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                      specialistCategoryFilter === 'SKIN'
                        ? 'bg-white text-emerald-800 shadow-2xs border border-stone-200'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <Smile className="w-3 h-3 text-emerald-600" />
                    <span>Skin Care</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpecialistCategoryFilter('HAIR')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                      specialistCategoryFilter === 'HAIR'
                        ? 'bg-white text-emerald-800 shadow-2xs border border-stone-200'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <Scissors className="w-3 h-3 text-emerald-600" />
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
                      className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                        selectedDoctorId === doc.id
                          ? 'bg-emerald-50 border-emerald-500 shadow-sm ring-1 ring-emerald-500/30'
                          : 'bg-stone-50/50 border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-2xl bg-white border border-stone-200 flex items-center justify-center text-xl flex-shrink-0 shadow-2xs">
                          {doc.photo}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <div className="font-bold text-xs text-stone-900">{doc.name}</div>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold border bg-emerald-50 border-emerald-200 text-emerald-800">
                              {doc.specialtyLabel}
                            </span>
                          </div>
                          <div className="text-[10px] text-stone-500">{doc.specialty}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold flex items-center space-x-1 ${
                          doc.dutyStatus === 'online'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : doc.dutyStatus === 'busy'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1 ${
                            doc.dutyStatus === 'online' ? 'bg-emerald-500 animate-pulse' : doc.dutyStatus === 'busy' ? 'bg-amber-500' : 'bg-rose-500'
                          }`} />
                          <span>{doc.dutyStatus === 'online' ? 'Online' : doc.dutyStatus === 'busy' ? 'Busy' : 'Off-Duty'}</span>
                        </span>
                        <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          {doc.rating}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Handoff Notes */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Mandatory Clinical Handoff Notes <span className="text-rose-600">*</span>
                </label>
                <textarea
                  value={handoffNotes}
                  onChange={(e) => setHandoffNotes(e.target.value)}
                  placeholder="Enter mandatory clinical handoff notes for the incoming specialist..."
                  rows={2}
                  className="w-full bg-stone-50 border border-stone-300 rounded-2xl p-3 text-xs text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:border-emerald-600 transition-all resize-none"
                />
              </div>

              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-2xl text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex items-center justify-end space-x-3 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSwitch}
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded-2xl shadow-md shadow-emerald-600/20 flex items-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
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
