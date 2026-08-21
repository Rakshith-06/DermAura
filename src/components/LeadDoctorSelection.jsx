import React, { useState, useMemo } from 'react';
import dermAuraLogo from '../dermAuraLogoNoBG.png';
import {
  Crown,
  Search,
  Stethoscope,
  ShieldCheck,
  Star,
  Languages,
  Clock,
  Building2,
  Check,
  ChevronRight,
  Award,
  Filter,
  X,
  HeartPulse,
  User,
  Smile,
  Scissors,
  Sparkles
} from 'lucide-react';

// ─── Mock doctor roster (General Physicians / PCPs) ─────────────────────────
// In production this comes from GET /api/doctors/primary-care
const MOCK_PCP_DOCTORS = [
  {
    // ── SIH Demo Doctor ── matches the demo login credentials exactly
    id: 'demo-doc-101',
    fullName: 'Dr. Sarah Jenkins',
    gender: 'Female',
    specialization: 'General Physician & Primary Care',
    specialtyDomain: 'BOTH', // 'SKIN' | 'HAIR' | 'BOTH'
    specialtyLabel: '✨💇 Dual Skin & Hair Specialist',
    qualifications: 'MBBS, MD',
    yearsOfExperience: 10,
    hospitalAffiliation: { name: 'AIIMS Hospital' },
    languagesSpoken: ['English', 'Hindi'],
    rating: 4.9,
    consultationFee: 500,
    isVerified: true,
    isDemoDoctor: true, // flag to render special badge
    photo: '👩‍⚕️',
    bio: 'SIH Demo Primary Care Doctor. Experienced in coordinating multi-specialist dermatological care, managing prescription safety and specialist referrals.',
  },
  {
    id: 'doc-pcp-1',
    fullName: 'Dr. Ananya Patel, MD',
    gender: 'Female',
    specialization: 'Facial & Clinical Skin Care Specialist',
    specialtyDomain: 'SKIN',
    specialtyLabel: '✨ Skin Care Specialist',
    qualifications: 'MBBS, MD (Internal Medicine)',
    yearsOfExperience: 14,
    hospitalAffiliation: { name: 'DermAura Clinical Center of Excellence' },
    languagesSpoken: ['English', 'Hindi', 'Gujarati'],
    rating: 4.9,
    consultationFee: 500,
    isVerified: true,
    photo: '👩‍⚕️',
    bio: 'Specializes in comprehensive facial skin acne, eczema, rosacea, and preventive dermatological care. Lead Gatekeeper for multi-specialist consultations.',
  },
  {
    id: 'doc-pcp-2',
    fullName: 'Dr. Rajesh Kumar, MBBS',
    gender: 'Male',
    specialization: 'Dermatology & Skin Barrier Specialist',
    specialtyDomain: 'SKIN',
    specialtyLabel: '✨ Skin Care Specialist',
    qualifications: 'MBBS, DNB (Family Medicine)',
    yearsOfExperience: 11,
    hospitalAffiliation: { name: 'Apollo Hospitals, Delhi' },
    languagesSpoken: ['English', 'Hindi', 'Bengali'],
    rating: 4.7,
    consultationFee: 400,
    isVerified: true,
    photo: '👨‍⚕️',
    bio: 'Experienced in managing chronic skin conditions (psoriasis, hyperpigmentation) alongside systemic health through coordinated care plans.',
  },
  {
    id: 'doc-pcp-3',
    fullName: 'Dr. Priya Menon, MD',
    gender: 'Female',
    specialization: 'Trichologist & Scalp Specialist',
    specialtyDomain: 'HAIR',
    specialtyLabel: '💇 Hair Care Specialist',
    qualifications: 'MBBS, MD (General Medicine)',
    yearsOfExperience: 9,
    hospitalAffiliation: { name: 'AIIMS New Delhi' },
    languagesSpoken: ['English', 'Tamil', 'Hindi'],
    rating: 4.8,
    consultationFee: 600,
    isVerified: true,
    photo: '👩‍⚕️',
    bio: 'Focused on scalp disorders, androgenetic alopecia, and hair loss prevention. Coordinates specialist referrals and prescription safety.',
  },
  {
    id: 'doc-pcp-4',
    fullName: 'Dr. Arjun Singh, MD',
    gender: 'Male',
    specialization: 'Hair Thinning & Follicle Specialist',
    specialtyDomain: 'HAIR',
    specialtyLabel: '💇 Hair Care Specialist',
    qualifications: 'MBBS, MD (Preventive Medicine)',
    yearsOfExperience: 7,
    hospitalAffiliation: { name: 'Fortis Hospitals, Mumbai' },
    languagesSpoken: ['English', 'Punjabi', 'Hindi'],
    rating: 4.6,
    consultationFee: 350,
    isVerified: true,
    photo: '👨‍⚕️',
    bio: 'Young, evidence-based trichology physician focused on hair regrowth protocols, telogen effluvium, and scalp health management.',
  },
  {
    id: 'doc-pcp-5',
    fullName: 'Dr. Sowmya Rao, DNB',
    gender: 'Female',
    specialization: 'General Medicine & Multi-Specialist',
    specialtyDomain: 'BOTH',
    specialtyLabel: '✨💇 Dual Skin & Hair Specialist',
    qualifications: 'MBBS, DNB (General Medicine)',
    yearsOfExperience: 12,
    hospitalAffiliation: { name: 'Manipal Hospital, Bengaluru' },
    languagesSpoken: ['English', 'Kannada', 'Telugu', 'Hindi'],
    rating: 4.9,
    consultationFee: 450,
    isVerified: true,
    photo: '👩‍⚕️',
    bio: 'Multilingual physician with expertise in both skin and scalp systemic health. Extensively experienced in coordinating dual-care plans.',
  },
  {
    id: 'doc-pcp-6',
    fullName: 'Dr. Vikram Nair, MD',
    gender: 'Male',
    specialization: 'Comprehensive Skin & Hair PCP',
    specialtyDomain: 'BOTH',
    specialtyLabel: '✨💇 Dual Skin & Hair Specialist',
    qualifications: 'MBBS, MD (Family Medicine)',
    yearsOfExperience: 16,
    hospitalAffiliation: { name: 'Max Healthcare, Hyderabad' },
    languagesSpoken: ['English', 'Malayalam', 'Hindi'],
    rating: 4.7,
    consultationFee: 550,
    isVerified: true,
    photo: '👨‍⚕️',
    bio: 'Senior family physician with deep experience as a Primary Care Provider for facial dermatoses and scalp conditions alike.',
  },
];

const SPECIALTY_DOMAIN_FILTERS = [
  { id: 'ALL', label: 'All Doctors', icon: Stethoscope, desc: 'Show all clinical providers' },
  { id: 'SKIN', label: '✨ Skin Care Specialist', icon: Smile, desc: 'Facial acne, rashes & skin barrier' },
  { id: 'HAIR', label: '💇 Hair Care Specialist', icon: Scissors, desc: 'Scalp health, alopecia & hair loss' },
];

const GENDER_FILTERS = ['All', 'Female', 'Male', 'Other'];
const EXP_FILTERS = [
  { label: 'Any Experience', value: 0 },
  { label: '5+ Years', value: 5 },
  { label: '10+ Years', value: 10 },
  { label: '15+ Years', value: 15 },
];
const LANGUAGE_OPTIONS = ['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Bengali', 'Gujarati', 'Punjabi', 'Malayalam'];

function StarRating({ rating }) {
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3 h-3 ${s <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`}
        />
      ))}
      <span className="text-[10px] font-mono text-amber-400 ml-1 font-bold">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function LeadDoctorSelection({ patientUser, onDoctorSelected }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [specialtyDomainFilter, setSpecialtyDomainFilter] = useState('ALL'); // 'ALL' | 'SKIN' | 'HAIR'
  const [genderFilter, setGenderFilter] = useState('All');
  const [expFilter, setExpFilter] = useState(0);
  const [langFilter, setLangFilter] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const selectedDoctor = MOCK_PCP_DOCTORS.find((d) => d.id === selectedDoctorId);

  const filteredDoctors = useMemo(() => {
    return MOCK_PCP_DOCTORS.filter((doc) => {
      const matchDomain =
        specialtyDomainFilter === 'ALL' ||
        doc.specialtyDomain === specialtyDomainFilter ||
        doc.specialtyDomain === 'BOTH';

      const matchSearch =
        !searchQuery ||
        doc.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.hospitalAffiliation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.languagesSpoken.some((l) => l.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchGender = genderFilter === 'All' || doc.gender === genderFilter;
      const matchExp = doc.yearsOfExperience >= expFilter;
      const matchLang =
        !langFilter || doc.languagesSpoken.some((l) => l.toLowerCase().includes(langFilter.toLowerCase()));

      return matchDomain && matchSearch && matchGender && matchExp && matchLang;
    });
  }, [specialtyDomainFilter, searchQuery, genderFilter, expFilter, langFilter]);

  const handleConfirm = async () => {
    if (!selectedDoctorId) return;
    setIsConfirming(true);

    try {
      // API call attempt (production)
      const response = await fetch('/api/patients/select-lead-doctor', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: patientUser?.id,
          doctorId: selectedDoctorId,
        }),
      });
      if (!response.ok) throw new Error('API unavailable');
    } catch (_) {
      // Demo/offline fallback — update localStorage user object
      console.warn('API not available — setting Lead Doctor in demo mode.');
    }

    // Update local user state
    const updatedUser = {
      ...patientUser,
      primaryLeadDoctorId: selectedDoctorId,
      primaryLeadDoctorName: selectedDoctor.fullName,
      isFirstLogin: false,
    };
    localStorage.setItem('dermaura_user', JSON.stringify(updatedUser));
    setIsConfirming(false);
    onDoctorSelected(updatedUser);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-teal-500/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">

        {/* ─── Header ─────────────────────────────────────────────────────── */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <img src={dermAuraLogo} alt="DermAura Logo" className="w-12 h-12 object-contain mx-auto drop-shadow-xl" />
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-amber-950/60 border border-amber-800/60 rounded-full text-amber-300 text-xs font-bold">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>One-Time Onboarding • Step 1 of 1</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
            Choose Your{' '}
            <span className="bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent">
              Primary Lead Doctor
            </span>
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Your Lead Doctor is your permanent Primary Care Provider (PCP). They coordinate all your specialist consults, review prescriptions for drug interactions, and approve all pharmacy items on your behalf.
          </p>

          {/* Patient welcome chip */}
          {patientUser?.fullName && (
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-full text-xs text-slate-300">
              <User className="w-3.5 h-3.5 text-teal-400" />
              <span>Welcome, <strong className="text-white">{patientUser.fullName}</strong></span>
            </div>
          )}
        </div>

        {/* ─── Search & Filter Bar ─────────────────────────────────────────── */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 space-y-4 backdrop-blur-md">
          {/* SPECIALIST CATEGORY FOCUS FILTER (Skin Care vs Hair Care Specialist) */}
          <div className="space-y-2 border-b border-slate-800/80 pb-3">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Filter Doctors by Specialty Domain</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {SPECIALTY_DOMAIN_FILTERS.map((f) => {
                const IconComponent = f.icon;
                const isActive = specialtyDomainFilter === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSpecialtyDomainFilter(f.id)}
                    className={`p-3 rounded-xl text-left border transition-all flex flex-col justify-between cursor-pointer ${
                      isActive
                        ? f.id === 'SKIN'
                          ? 'bg-teal-500/20 border-teal-500 text-white shadow-lg shadow-teal-500/10'
                          : f.id === 'HAIR'
                          ? 'bg-indigo-500/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                          : 'bg-amber-500/20 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <IconComponent className={`w-4 h-4 ${
                        isActive
                          ? f.id === 'SKIN' ? 'text-teal-400' : f.id === 'HAIR' ? 'text-indigo-400' : 'text-amber-400'
                          : 'text-slate-500'
                      }`} />
                      <span className="font-bold text-xs">{f.label}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1">{f.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search by name, hospital, or language…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-all"
              />
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                showFilters ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>

          {/* Filter Panels */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800">
              {/* Gender */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Doctor Gender</label>
                <div className="flex flex-wrap gap-1.5">
                  {GENDER_FILTERS.map((g) => (
                    <button
                      key={g}
                      onClick={() => setGenderFilter(g)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        genderFilter === g
                          ? 'bg-teal-500 text-slate-950'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Experience</label>
                <div className="flex flex-wrap gap-1.5">
                  {EXP_FILTERS.map((ef) => (
                    <button
                      key={ef.value}
                      onClick={() => setExpFilter(ef.value)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        expFilter === ef.value
                          ? 'bg-indigo-500 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {ef.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Language Spoken</label>
                <select
                  value={langFilter}
                  onChange={(e) => setLangFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Any Language</option>
                  {LANGUAGE_OPTIONS.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Results count */}
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono pt-1">
            <span>
              {filteredDoctors.length} Doctor{filteredDoctors.length !== 1 ? 's' : ''} available
              {specialtyDomainFilter !== 'ALL' && ` for ${specialtyDomainFilter === 'SKIN' ? 'Skin Care' : 'Hair Care'}`}
            </span>
            {(specialtyDomainFilter !== 'ALL' || genderFilter !== 'All' || expFilter !== 0 || langFilter !== '' || searchQuery !== '') && (
              <button
                onClick={() => { setSpecialtyDomainFilter('ALL'); setGenderFilter('All'); setExpFilter(0); setLangFilter(''); setSearchQuery(''); }}
                className="text-teal-400 underline font-sans text-xs"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* ─── Doctor Cards Grid ───────────────────────────────────────────── */}
        {filteredDoctors.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <Stethoscope className="w-10 h-10 text-slate-700 mx-auto" />
            <p className="text-slate-400 text-sm">No doctors match your specialty filters. Try selecting 'All Doctors'.</p>
            <button onClick={() => { setSpecialtyDomainFilter('ALL'); setGenderFilter('All'); setExpFilter(0); setLangFilter(''); setSearchQuery(''); }}
              className="text-xs text-teal-400 underline">Reset all filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredDoctors.map((doc) => {
              const isSelected = selectedDoctorId === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoctorId(doc.id)}
                  className={`relative cursor-pointer rounded-3xl border p-5 space-y-4 transition-all duration-200 ${
                    isSelected
                      ? 'bg-gradient-to-br from-teal-950/60 via-slate-900 to-indigo-950/60 border-teal-500/70 shadow-2xl shadow-teal-500/20 scale-[1.01]'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:shadow-xl'
                  }`}
                >
                  {/* Selected checkmark */}
                  {isSelected && (
                    <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/40">
                      <Check className="w-4 h-4 text-slate-950 font-bold" />
                    </div>
                  )}

                  {/* Doctor Identity */}
                  <div className="flex items-start space-x-3">
                    <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-3xl flex-shrink-0 shadow-inner">
                      {doc.photo}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                        <h3 className="text-sm font-bold text-white truncate">{doc.fullName}</h3>
                        {doc.isVerified && (
                          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" title="Verified Doctor" />
                        )}
                      </div>
                      {doc.isDemoDoctor && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-amber-950 border border-amber-700 rounded-full text-[9px] font-mono font-bold text-amber-300 mt-0.5">
                          <span>⭐ SIH Demo Doctor</span>
                        </span>
                      )}

                      {/* Domain Tag Badge */}
                      <div className="mt-1">
                        <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold border ${
                          doc.specialtyDomain === 'SKIN'
                            ? 'bg-teal-500/10 border-teal-500/30 text-teal-300'
                            : doc.specialtyDomain === 'HAIR'
                            ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                            : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                        }`}>
                          {doc.specialtyDomain === 'SKIN' && <Smile className="w-3 h-3 text-teal-400" />}
                          {doc.specialtyDomain === 'HAIR' && <Scissors className="w-3 h-3 text-indigo-400" />}
                          {doc.specialtyDomain === 'BOTH' && <Sparkles className="w-3 h-3 text-amber-400" />}
                          <span>{doc.specialtyLabel}</span>
                        </span>
                      </div>

                      <p className="text-[11px] text-indigo-300 font-semibold mt-1">{doc.specialization}</p>
                      <StarRating rating={doc.rating} />
                    </div>
                  </div>

                  {/* Credential Badges */}
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded-lg text-[10px] font-mono text-slate-300 flex items-center space-x-1">
                      <Award className="w-3 h-3 text-indigo-400" />
                      <span>{doc.qualifications}</span>
                    </span>
                    <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded-lg text-[10px] font-mono text-teal-300 flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-teal-400" />
                      <span>{doc.yearsOfExperience}+ Yrs Exp</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded-lg border text-[10px] font-mono flex items-center space-x-1 ${
                      doc.gender === 'Female'
                        ? 'bg-rose-950/60 border-rose-800/60 text-rose-300'
                        : 'bg-blue-950/60 border-blue-800/60 text-blue-300'
                    }`}>
                      <User className="w-3 h-3" />
                      <span>{doc.gender}</span>
                    </span>
                  </div>

                  {/* Hospital */}
                  <div className="flex items-center space-x-2 text-xs text-slate-400">
                    <Building2 className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    <span className="truncate">{doc.hospitalAffiliation.name}</span>
                  </div>

                  {/* Languages */}
                  <div className="flex items-start space-x-2">
                    <Languages className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="flex flex-wrap gap-1">
                      {doc.languagesSpoken.map((lang) => (
                        <span
                          key={lang}
                          className="px-1.5 py-0.5 bg-amber-950/40 border border-amber-800/40 rounded text-[9.5px] font-mono text-amber-300"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">{doc.bio}</p>

                  {/* Fee & CTA */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-500">Consultation Fee</p>
                      <p className="text-sm font-black text-white">₹{doc.consultationFee}<span className="text-[10px] font-normal text-slate-500"> /session</span></p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedDoctorId(doc.id); }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                        isSelected
                          ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/30'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Selected</span>
                        </>
                      ) : (
                        <>
                          <HeartPulse className="w-3.5 h-3.5" />
                          <span>Select</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ─── Fixed Bottom Confirmation Bar ───────────────────────────────── */}
        <div className={`sticky bottom-4 z-20 transition-all duration-300 ${selectedDoctor ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'}`}>
          <div className="bg-slate-900/95 border border-teal-500/50 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl shadow-teal-500/20 backdrop-blur-md max-w-3xl mx-auto">
            {selectedDoctor && (
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-950 border border-teal-800 flex items-center justify-center text-2xl shadow-inner">
                  {selectedDoctor.photo}
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-xs text-amber-300 font-bold">Selected as Lead PCP</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{selectedDoctor.fullName}</h4>
                  <p className="text-[11px] text-teal-400">{selectedDoctor.specialization}</p>
                </div>
              </div>
            )}

            <button
              onClick={handleConfirm}
              disabled={isConfirming || !selectedDoctorId}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-teal-500 to-indigo-500 hover:from-teal-400 hover:to-indigo-400 disabled:opacity-50 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-teal-500/30 flex items-center justify-center space-x-2 transition-all"
            >
              {isConfirming ? (
                <span className="animate-pulse">Confirming…</span>
              ) : (
                <>
                  <span>Confirm My Lead Doctor</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Bottom padding for sticky bar */}
        <div className="h-16" />
      </div>
    </div>
  );
}
