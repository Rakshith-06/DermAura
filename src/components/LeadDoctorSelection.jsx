import React, { useState, useMemo } from 'react';
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
  Sparkles,
  Zap
} from 'lucide-react';
import dermAuraLogo from '../dermAuraLogoNoBG.png';

// ─── Categories Definition ──────────────────────────────────────────────────
export const CLINICAL_CATEGORIES = [
  {
    id: 'SKIN_CARE',
    title: 'Facial & Skin Care',
    shortLabel: 'Skin Care',
    icon: Sparkles,
    badgeColor: 'teal',
    desc: 'Facial Acne, Rosacea, Eczema, Dermatitis & Hyperpigmentation',
    matchDomains: ['SKIN', 'BOTH'],
  },
  {
    id: 'HAIR_CARE',
    title: 'Hair & Scalp Health',
    shortLabel: 'Hair Care',
    icon: Scissors,
    badgeColor: 'indigo',
    desc: 'Alopecia, Scalp Psoriasis, Telogen Effluvium & Follicle Care',
    matchDomains: ['HAIR', 'BOTH'],
  },
  {
    id: 'GENERAL_HEALTH',
    title: 'General Health & Vitals',
    shortLabel: 'General Care',
    icon: HeartPulse,
    badgeColor: 'amber',
    desc: 'Prescription Safety Gatekeeper, Neuro-Stress & Interaction Checks',
    matchDomains: ['GENERAL', 'BOTH', 'SKIN', 'HAIR'],
  },
];

// ─── Mock doctor roster ─────────────────────────────────────────────────────
export const MOCK_PCP_DOCTORS = [
  {
    id: 'demo-doc-101',
    fullName: 'Dr. Sarah Jenkins, MD',
    gender: 'Female',
    specialization: 'Dermatology & Clinical Trichology',
    specialtyDomain: 'BOTH', // 'SKIN' | 'HAIR' | 'BOTH' | 'GENERAL'
    specialtyLabel: '✨💇 Dual Skin & Hair Specialist',
    qualifications: 'MBBS, MD Dermatology (AIIMS New Delhi)',
    yearsOfExperience: 14,
    hospitalAffiliation: { name: 'AIIMS Hospital & DermAura Board' },
    languagesSpoken: ['English', 'Hindi', 'Punjabi'],
    rating: 4.9,
    consultationFee: 500,
    isVerified: true,
    isDemoDoctor: true,
    photo: '👩‍⚕️',
    bio: 'Lead SIH Board-certified Specialist. Experienced in coordinating multi-specialist care for both facial skin lesions and hair loss treatments.',
  },
  {
    id: 'doc-pcp-1',
    fullName: 'Dr. Ananya Patel, MD',
    gender: 'Female',
    specialization: 'Facial Dermatology & Barrier Specialist',
    specialtyDomain: 'SKIN',
    specialtyLabel: '✨ Skin Care Specialist',
    qualifications: 'MBBS, MD (Dermatology)',
    yearsOfExperience: 12,
    hospitalAffiliation: { name: 'DermAura Clinical Center of Excellence' },
    languagesSpoken: ['English', 'Hindi', 'Gujarati'],
    rating: 4.9,
    consultationFee: 500,
    isVerified: true,
    photo: '👩‍⚕️',
    bio: 'Specializes in comprehensive facial skin acne, eczema, rosacea, and preventive dermatological care.',
  },
  {
    id: 'doc-pcp-2',
    fullName: 'Dr. Rajesh Kumar, MBBS, DNB',
    gender: 'Male',
    specialization: 'Internal Medicine & General Physician',
    specialtyDomain: 'GENERAL',
    specialtyLabel: '🩺 General Health Gatekeeper',
    qualifications: 'MBBS, DNB (Internal Medicine)',
    yearsOfExperience: 11,
    hospitalAffiliation: { name: 'Apollo Hospitals, Delhi' },
    languagesSpoken: ['English', 'Hindi', 'Bengali'],
    rating: 4.7,
    consultationFee: 400,
    isVerified: true,
    photo: '👨‍⚕️',
    bio: 'Experienced in systemic health evaluations, drug interaction verification, and overall medical governance.',
  },
  {
    id: 'doc-pcp-3',
    fullName: 'Dr. Priya Menon, MD',
    gender: 'Female',
    specialization: 'Trichologist & Scalp Specialist',
    specialtyDomain: 'HAIR',
    specialtyLabel: '💇 Hair Care Specialist',
    qualifications: 'MBBS, MD (Trichology & Medicine)',
    yearsOfExperience: 9,
    hospitalAffiliation: { name: 'AIIMS New Delhi' },
    languagesSpoken: ['English', 'Tamil', 'Hindi'],
    rating: 4.8,
    consultationFee: 600,
    isVerified: true,
    photo: '👩‍⚕️',
    bio: 'Focused on scalp disorders, androgenetic alopecia, and hair loss prevention protocols.',
  },
  {
    id: 'doc-pcp-4',
    fullName: 'Dr. Arjun Singh, MD',
    gender: 'Male',
    specialization: 'Hair Follicle & Scalp Pathologist',
    specialtyDomain: 'HAIR',
    specialtyLabel: '💇 Hair Care Specialist',
    qualifications: 'MBBS, MD',
    yearsOfExperience: 8,
    hospitalAffiliation: { name: 'Fortis Hospitals, Mumbai' },
    languagesSpoken: ['English', 'Punjabi', 'Hindi'],
    rating: 4.6,
    consultationFee: 350,
    isVerified: true,
    photo: '👨‍⚕️',
    bio: 'Evidence-based trichology physician focused on hair regrowth protocols, telogen effluvium, and scalp health.',
  },
  {
    id: 'doc-pcp-5',
    fullName: 'Dr. Vikramaditya Sen, MD',
    gender: 'Male',
    specialization: 'Dermatologist & General Physician',
    specialtyDomain: 'BOTH',
    specialtyLabel: '✨💇 Dual Skin & Hair Specialist',
    qualifications: 'MBBS, MD (AIIMS)',
    yearsOfExperience: 16,
    hospitalAffiliation: { name: 'Max Healthcare & DermAura Panel' },
    languagesSpoken: ['English', 'Hindi', 'Bengali'],
    rating: 4.9,
    consultationFee: 700,
    isVerified: true,
    photo: '👨‍⚕️',
    bio: 'Senior consultant specializing in complex facial dermatoses, hair restoration therapies, and medication approvals.',
  },
];

const GENDER_FILTERS = ['All', 'Female', 'Male'];
const EXP_FILTERS = [
  { label: 'Any Exp', value: 0 },
  { label: '8+ Yrs', value: 8 },
  { label: '12+ Yrs', value: 12 },
];
const LANGUAGE_OPTIONS = ['Hindi', 'English', 'Tamil', 'Punjabi', 'Bengali', 'Gujarati'];

export default function LeadDoctorSelection({
  patientUser,
  onDoctorSelected = () => {},
}) {
  // Pre-seed default assignments (Dr. Sarah Jenkins pre-selected for Skin & Hair, Dr. Rajesh for General)
  const [categoryAssignments, setCategoryAssignments] = useState(() => {
    const existingLeadDocs = patientUser?.leadDoctors || [];
    const findCat = (cat) => existingLeadDocs.find((ld) => ld.category === cat && ld.status === 'ACTIVE')?.doctorId;
    const legacyDocId = patientUser?.primaryLeadDoctorId || 'demo-doc-101';

    return {
      SKIN_CARE: findCat('SKIN_CARE') || legacyDocId,
      HAIR_CARE: findCat('HAIR_CARE') || legacyDocId,
      GENERAL_HEALTH: findCat('GENERAL_HEALTH') || 'doc-pcp-2',
    };
  });

  const [activeCategoryTab, setActiveCategoryTab] = useState('SKIN_CARE');
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState('All');
  const [expFilter, setExpFilter] = useState(0);
  const [langFilter, setLangFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  // Filter doctors for the currently active category tab
  const currentCategoryObj = CLINICAL_CATEGORIES.find((c) => c.id === activeCategoryTab);

  const filteredDoctors = useMemo(() => {
    return MOCK_PCP_DOCTORS.filter((doc) => {
      // Domain matching for the active category
      const matchCategory = currentCategoryObj
        ? currentCategoryObj.matchDomains.includes(doc.specialtyDomain)
        : true;

      const matchSearch =
        !searchQuery ||
        doc.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.hospitalAffiliation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.languagesSpoken.some((l) => l.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchGender = genderFilter === 'All' || doc.gender === genderFilter;
      const matchExp = doc.yearsOfExperience >= expFilter;
      const matchLang =
        !langFilter || doc.languagesSpoken.some((l) => l.toLowerCase().includes(langFilter.toLowerCase()));

      return matchCategory && matchSearch && matchGender && matchExp && matchLang;
    });
  }, [currentCategoryObj, searchQuery, genderFilter, expFilter, langFilter]);

  // Assign a doctor to a specific category
  const handleAssignCategory = (category, doctorId) => {
    setCategoryAssignments((prev) => ({
      ...prev,
      [category]: doctorId,
    }));
  };

  // 1-Click: Appoint doctor for BOTH Skin & Hair Care
  const handleAssignBothSkinAndHair = (doctorId) => {
    setCategoryAssignments((prev) => ({
      ...prev,
      SKIN_CARE: doctorId,
      HAIR_CARE: doctorId,
    }));
  };

  // 1-Click: Appoint doctor for ALL 3 Categories
  const handleAssignAllCategories = (doctorId) => {
    setCategoryAssignments({
      SKIN_CARE: doctorId,
      HAIR_CARE: doctorId,
      GENERAL_HEALTH: doctorId,
    });
  };

  const getDoctorById = (id) => MOCK_PCP_DOCTORS.find((d) => d.id === id);

  const handleConfirmAll = async () => {
    setIsConfirming(true);

    const leadDoctorsArray = CLINICAL_CATEGORIES.map((cat) => {
      const docId = categoryAssignments[cat.id];
      const doc = getDoctorById(docId);
      return {
        category: cat.id,
        doctorId: docId,
        doctorName: doc?.fullName || 'Dr. Sarah Jenkins',
        specialization: doc?.specialization || 'Dermatology',
        hospitalName: doc?.hospitalAffiliation?.name || 'AIIMS Hospital',
        assignedAt: new Date().toISOString(),
        status: 'ACTIVE',
      };
    });

    const skinLead = getDoctorById(categoryAssignments.SKIN_CARE);

    const updatedUser = {
      ...patientUser,
      leadDoctors: leadDoctorsArray,
      primaryLeadDoctorId: categoryAssignments.SKIN_CARE || 'demo-doc-101',
      primaryLeadDoctorName: skinLead?.fullName || 'Dr. Sarah Jenkins',
      isFirstLogin: false,
    };

    try {
      await fetch('/api/patients/assign-category-lead-doctors', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: patientUser?.id,
          assignments: leadDoctorsArray.map((ld) => ({
            category: ld.category,
            doctorId: ld.doctorId,
          })),
        }),
      });
    } catch (_) {
      console.warn('Backend API not reachable — persisted in client state.');
    }

    localStorage.setItem('dermaura_user', JSON.stringify(updatedUser));
    setIsConfirming(false);
    onDoctorSelected(updatedUser);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden font-sans pb-16">
      {/* Background Glows */}
      <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-teal-500/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* ─── Header ─────────────────────────────────────────────────────── */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <img src={dermAuraLogo} alt="DermAura Logo" className="w-12 h-12 object-contain mx-auto drop-shadow-xl" />
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-amber-950/60 border border-amber-800/60 rounded-full text-amber-300 text-xs font-bold">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>Multi-Category Clinical Onboarding</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
            Choose Your{' '}
            <span className="bg-gradient-to-r from-teal-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
              Category Lead Doctors
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            DermAura allows you to appoint specialized Lead Doctors for each domain. You can appoint the same specialist for multiple treatments (e.g. Skin & Hair), or select independent experts for each category.
          </p>

          {patientUser?.fullName && (
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-full text-xs text-slate-300">
              <User className="w-3.5 h-3.5 text-teal-400" />
              <span>Welcome, <strong className="text-white">{patientUser.fullName}</strong></span>
            </div>
          )}
        </div>

        {/* ─── 3 Category Assignment Status Cards ─────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {CLINICAL_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const assignedDocId = categoryAssignments[cat.id];
            const assignedDoc = getDoctorById(assignedDocId);
            const isTabActive = activeCategoryTab === cat.id;

            return (
              <div
                key={cat.id}
                onClick={() => setActiveCategoryTab(cat.id)}
                className={`p-4 rounded-3xl border text-left cursor-pointer transition-all duration-200 relative ${
                  isTabActive
                    ? 'bg-slate-900/90 border-teal-500/80 ring-2 ring-teal-500/20 shadow-xl shadow-teal-950/30'
                    : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/70'
                }`}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <div className={`p-2 rounded-2xl flex items-center space-x-2 ${
                    cat.id === 'SKIN_CARE'
                      ? 'bg-teal-500/15 text-teal-400'
                      : cat.id === 'HAIR_CARE'
                      ? 'bg-indigo-500/15 text-indigo-400'
                      : 'bg-amber-500/15 text-amber-400'
                  }`}>
                    <Icon className="w-4 h-4" />
                    <span className="text-xs font-bold">{cat.shortLabel}</span>
                  </div>

                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center space-x-1">
                    <Check className="w-3 h-3" />
                    <span>Assigned</span>
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white truncate">{cat.title}</h3>
                <p className="text-[10px] text-slate-400 line-clamp-1 mb-3">{cat.desc}</p>

                {/* Assigned Doctor Mini Preview */}
                <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800/90 flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-base flex-shrink-0">
                    {assignedDoc?.photo || '👨‍⚕️'}
                  </div>
                  <div className="truncate flex-1">
                    <p className="text-xs font-bold text-slate-100 truncate">{assignedDoc?.fullName || 'Select Doctor'}</p>
                    <p className="text-[10px] text-teal-400 font-mono truncate">{assignedDoc?.specialization || 'Clinical Specialist'}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ─── Active Category Selector & Doctor Roster ─────────────────────── */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono uppercase tracking-wider text-teal-400 font-bold">Step 2 • Select Specialist</span>
                <span className="text-slate-500">•</span>
                <span className="text-xs font-bold text-white">{currentCategoryObj?.title}</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Choose the attending lead doctor who will oversee your {currentCategoryObj?.shortLabel.toLowerCase()} treatments.
              </p>
            </div>

            {/* Category Switcher Pills */}
            <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 self-start">
              {CLINICAL_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategoryTab(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeCategoryTab === cat.id
                      ? 'bg-teal-500 text-slate-950 shadow-md font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat.shortLabel}
                </button>
              ))}
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search specialists by name, hospital, or language…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-all"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                showFilters ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>
          </div>

          {/* Expanded Filter Panel */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Gender</label>
                <div className="flex gap-1.5">
                  {GENDER_FILTERS.map((g) => (
                    <button
                      key={g}
                      onClick={() => setGenderFilter(g)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                        genderFilter === g ? 'bg-teal-500 text-slate-950' : 'bg-slate-950 text-slate-400 hover:text-white'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Experience</label>
                <div className="flex gap-1.5">
                  {EXP_FILTERS.map((ef) => (
                    <button
                      key={ef.value}
                      onClick={() => setExpFilter(ef.value)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                        expFilter === ef.value ? 'bg-indigo-500 text-white' : 'bg-slate-950 text-slate-400 hover:text-white'
                      }`}
                    >
                      {ef.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Language</label>
                <select
                  value={langFilter}
                  onChange={(e) => setLangFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Any Language</option>
                  {LANGUAGE_OPTIONS.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Doctors Grid for Active Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDoctors.map((doc) => {
              const isAssignedToThisCategory = categoryAssignments[activeCategoryTab] === doc.id;
              const isDualSpecialist = doc.specialtyDomain === 'BOTH';

              return (
                <div
                  key={doc.id}
                  className={`rounded-3xl border p-4 sm:p-5 space-y-3.5 transition-all duration-200 flex flex-col justify-between ${
                    isAssignedToThisCategory
                      ? 'bg-gradient-to-br from-teal-950/60 via-slate-900 to-indigo-950/60 border-teal-500/80 shadow-xl shadow-teal-950/40 ring-1 ring-teal-500/40'
                      : 'bg-slate-950/70 border-slate-800/90 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-2xl shadow-inner">
                          {doc.photo}
                        </div>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <h4 className="text-sm font-bold text-white">{doc.fullName}</h4>
                            {doc.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />}
                          </div>
                          <p className="text-xs text-teal-400 font-mono font-medium">{doc.specialization}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-300 text-[11px] font-bold font-mono">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{doc.rating}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 text-[10px]">
                      <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300 flex items-center space-x-1">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        <span className="truncate max-w-[140px]">{doc.hospitalAffiliation.name}</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-emerald-400 font-mono font-bold">
                        {doc.yearsOfExperience} Yrs Exp
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400">
                        {doc.languagesSpoken.slice(0, 2).join(', ')}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                      {doc.bio}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-2 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => handleAssignCategory(activeCategoryTab, doc.id)}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                        isAssignedToThisCategory
                          ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                      }`}
                    >
                      {isAssignedToThisCategory ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Assigned as {currentCategoryObj?.shortLabel} Lead ✓</span>
                        </>
                      ) : (
                        <span>Assign as {currentCategoryObj?.shortLabel} Lead</span>
                      )}
                    </button>

                    {/* Dual Purpose Quick Action */}
                    {isDualSpecialist && (
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleAssignBothSkinAndHair(doc.id)}
                          className="py-1.5 px-2 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-800 text-[10px] font-bold text-indigo-300 transition-all flex items-center justify-center space-x-1"
                        >
                          <Zap className="w-3 h-3 text-indigo-400" />
                          <span>Both Skin & Hair</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAssignAllCategories(doc.id)}
                          className="py-1.5 px-2 rounded-lg bg-amber-950/60 hover:bg-amber-900/80 border border-amber-800 text-[10px] font-bold text-amber-300 transition-all flex items-center justify-center space-x-1"
                        >
                          <Crown className="w-3 h-3 text-amber-400" />
                          <span>All 3 Categories</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Final Confirmation Bottom Bar ───────────────────────────────── */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl backdrop-blur-xl">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-sm font-bold text-white">Review & Confirm Your Healthcare Team</h4>
            <p className="text-xs text-slate-400">
              Skin: <strong className="text-teal-300">{getDoctorById(categoryAssignments.SKIN_CARE)?.fullName}</strong> • 
              Hair: <strong className="text-indigo-300">{getDoctorById(categoryAssignments.HAIR_CARE)?.fullName}</strong> • 
              General: <strong className="text-amber-300">{getDoctorById(categoryAssignments.GENERAL_HEALTH)?.fullName}</strong>
            </p>
          </div>

          <button
            type="button"
            disabled={isConfirming}
            onClick={handleConfirmAll}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-500 hover:from-teal-400 hover:to-emerald-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-teal-500/25 flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            {isConfirming ? (
              <span>Saving Medical Team...</span>
            ) : (
              <>
                <span>Confirm Category Doctors & Launch Dashboard</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
