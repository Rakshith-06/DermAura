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
    badgeColor: 'emerald',
    desc: 'Facial Acne, Rosacea, Eczema, Dermatitis & Hyperpigmentation',
    matchDomains: ['SKIN', 'BOTH'],
  },
  {
    id: 'HAIR_CARE',
    title: 'Hair & Scalp Health',
    shortLabel: 'Hair Care',
    icon: Scissors,
    badgeColor: 'emerald',
    desc: 'Alopecia, Scalp Psoriasis, Telogen Effluvium & Follicle Care',
    matchDomains: ['HAIR', 'BOTH'],
  },
  {
    id: 'GENERAL_HEALTH',
    title: 'General Health & Vitals',
    shortLabel: 'General Care',
    icon: HeartPulse,
    badgeColor: 'emerald',
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
    specialtyLabel: '✨ Facial Skin Specialist',
    qualifications: 'MBBS, MD Dermatology (KEM Mumbai)',
    yearsOfExperience: 12,
    hospitalAffiliation: { name: 'Apollo Hospitals Mumbai' },
    languagesSpoken: ['English', 'Hindi', 'Gujarati'],
    rating: 4.9,
    consultationFee: 500,
    isVerified: true,
    isDemoDoctor: false,
    photo: '👩‍⚕️',
    bio: 'Senior Consultant Dermatologist with 12+ years expertise in acne vulgaris, rosacea, and skin barrier microbiome repair.',
  },
  {
    id: 'doc-pcp-3',
    fullName: 'Dr. Priya Menon, MD',
    gender: 'Female',
    specialization: 'Trichologist & Scalp Specialist',
    specialtyDomain: 'HAIR',
    specialtyLabel: '💇 Scalp & Hair Specialist',
    qualifications: 'MBBS, MD (PGIMER Chandigarh)',
    yearsOfExperience: 11,
    hospitalAffiliation: { name: 'AIIMS New Delhi' },
    languagesSpoken: ['English', 'Hindi', 'Malayalam'],
    rating: 4.9,
    consultationFee: 500,
    isVerified: true,
    isDemoDoctor: false,
    photo: '👩‍⚕️',
    bio: 'Dedicated trichology expert specializing in androgenic alopecia, telogen effluvium, and topical minoxidil management.',
  },
  {
    id: 'doc-pcp-2',
    fullName: 'Dr. Rajesh Kumar, MBBS, DNB',
    gender: 'Male',
    specialization: 'Internal Medicine & Drug Safety Gatekeeper',
    specialtyDomain: 'GENERAL',
    specialtyLabel: '🩺 General Physician Gatekeeper',
    qualifications: 'MBBS, DNB Family Medicine (CMC Vellore)',
    yearsOfExperience: 15,
    hospitalAffiliation: { name: 'Apollo Hospitals & AIIMS Network' },
    languagesSpoken: ['English', 'Hindi', 'Tamil'],
    rating: 4.8,
    consultationFee: 450,
    isVerified: true,
    isDemoDoctor: false,
    photo: '👨‍⚕️',
    bio: 'Primary Care Physician and pharmacovigilance lead. Oversees systemic medication safety and prevents adverse multi-specialist interactions.',
  },
  {
    id: 'doc-pcp-4',
    fullName: 'Dr. Vikramaditya Sen, MD',
    gender: 'Male',
    specialization: 'Advanced Trichology & Hair Restoration',
    specialtyDomain: 'HAIR',
    specialtyLabel: '💇 Hair Restoration Specialist',
    qualifications: 'MBBS, MD, Fellowship in Trichology',
    yearsOfExperience: 16,
    hospitalAffiliation: { name: 'Apollo Dermatological Institute' },
    languagesSpoken: ['English', 'Hindi', 'Bengali'],
    rating: 4.9,
    consultationFee: 550,
    isVerified: true,
    isDemoDoctor: false,
    photo: '👨‍⚕️',
    bio: 'Specialist in complex scalp disorders, vertex thinning restoration, and dual-action peptide protocols.',
  },
  {
    id: 'doc-pcp-5',
    fullName: 'Dr. Meera Reddy, MD',
    gender: 'Female',
    specialization: 'Dermatopathology & Skin Barrier Specialist',
    specialtyDomain: 'SKIN',
    specialtyLabel: '✨ Skin Barrier Specialist',
    qualifications: 'MBBS, MD (NIMHANS & Manipal)',
    yearsOfExperience: 9,
    hospitalAffiliation: { name: 'Fortis Skin & Laser Center' },
    languagesSpoken: ['English', 'Hindi', 'Telugu'],
    rating: 4.8,
    consultationFee: 500,
    isVerified: true,
    isDemoDoctor: false,
    photo: '👩‍⚕️',
    bio: 'Focused on holistic dermatology, retinoid tolerance ramping, and sensitive skin barrier restoration.',
  },
];

const GENDER_FILTERS = ['All', 'Female', 'Male'];
const EXP_FILTERS = [
  { label: 'All Experience', value: 0 },
  { label: '10+ Years', value: 10 },
  { label: '15+ Years', value: 15 },
];
const LANGUAGE_OPTIONS = ['English', 'Hindi', 'Punjabi', 'Gujarati', 'Malayalam', 'Tamil', 'Bengali', 'Telugu'];

export default function LeadDoctorSelection({
  patientUser,
  onDoctorSelected,
  onCancel,
}) {
  const [activeCategoryTab, setActiveCategoryTab] = useState('SKIN_CARE');

  const [categoryAssignments, setCategoryAssignments] = useState(() => {
    return {
      SKIN_CARE: 'demo-doc-101',      // Dr. Sarah Jenkins (Facial Skin)
      HAIR_CARE: 'doc-pcp-3',         // Dr. Priya Menon (Hair & Scalp)
      GENERAL_HEALTH: 'doc-pcp-2',    // Dr. Rajesh Kumar (General Health)
    };
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState('All');
  const [expFilter, setExpFilter] = useState(0);
  const [langFilter, setLangFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const getDoctorById = (id) => MOCK_PCP_DOCTORS.find((d) => d.id === id) || MOCK_PCP_DOCTORS[0];

  const currentCategoryObj = CLINICAL_CATEGORIES.find((c) => c.id === activeCategoryTab);

  const filteredDoctors = useMemo(() => {
    return MOCK_PCP_DOCTORS.filter((doc) => {
      const matchCat = currentCategoryObj?.matchDomains.includes(doc.specialtyDomain) || doc.specialtyDomain === 'BOTH' || currentCategoryObj?.id === 'GENERAL_HEALTH';

      const matchSearch =
        searchQuery === '' ||
        doc.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.hospitalAffiliation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.languagesSpoken.some((l) => l.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchGender = genderFilter === 'All' || doc.gender === genderFilter;
      const matchExp = doc.yearsOfExperience >= expFilter;
      const matchLang = !langFilter || doc.languagesSpoken.includes(langFilter);

      return matchCat && matchSearch && matchGender && matchExp && matchLang;
    });
  }, [currentCategoryObj, searchQuery, genderFilter, expFilter, langFilter]);

  const handleAssignCategory = (categoryId, doctorId) => {
    setCategoryAssignments((prev) => ({
      ...prev,
      [categoryId]: doctorId,
    }));
  };

  const handleAssignBothSkinAndHair = (doctorId) => {
    setCategoryAssignments((prev) => ({
      ...prev,
      SKIN_CARE: doctorId,
      HAIR_CARE: doctorId,
    }));
  };

  const handleAssignAllCategories = (doctorId) => {
    setCategoryAssignments({
      SKIN_CARE: doctorId,
      HAIR_CARE: doctorId,
      GENERAL_HEALTH: doctorId,
    });
  };

  const handleConfirmAll = async () => {
    setIsConfirming(true);

    const skinDoc = getDoctorById(categoryAssignments.SKIN_CARE);
    const hairDoc = getDoctorById(categoryAssignments.HAIR_CARE);
    const generalDoc = getDoctorById(categoryAssignments.GENERAL_HEALTH);

    const leadDoctorsArray = [
      {
        category: 'SKIN_CARE',
        doctorId: skinDoc.id,
        doctorName: skinDoc.fullName,
        specialization: skinDoc.specialization,
        status: 'ACTIVE',
      },
      {
        category: 'HAIR_CARE',
        doctorId: hairDoc.id,
        doctorName: hairDoc.fullName,
        specialization: hairDoc.specialization,
        status: 'ACTIVE',
      },
      {
        category: 'GENERAL_HEALTH',
        doctorId: generalDoc.id,
        doctorName: generalDoc.fullName,
        specialization: generalDoc.specialization,
        status: 'ACTIVE',
      },
    ];

    const updatedUser = {
      ...patientUser,
      leadDoctors: leadDoctorsArray,
      primaryLeadDoctorId: skinDoc.id,
      primaryLeadDoctorName: skinDoc.fullName,
      isFirstLogin: false,
    };

    try {
      localStorage.setItem('dermaura_user', JSON.stringify(updatedUser));
    } catch (_) {}

    try {
      await fetch('/api/patients/assign-category-lead-doctors', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: patientUser?.id || patientUser?._id,
          assignments: leadDoctorsArray,
        }),
      });
    } catch (_) {}

    setIsConfirming(false);
    onDoctorSelected(updatedUser);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans relative overflow-x-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-100/50 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-100/50 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-5xl space-y-6 relative z-10 animate-in fade-in duration-300">
        
        {/* Top Header Card */}
        <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 text-center space-y-3 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-center space-x-2">
            <img src={dermAuraLogo} alt="DermAura" className="w-9 h-9 object-contain drop-shadow-sm" />
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900">
              Derm<span className="text-emerald-600">Aura</span> Multi-Specialist Team Setup
            </h1>
          </div>

          <p className="text-xs sm:text-sm text-stone-600 max-w-2xl mx-auto leading-relaxed">
            DermAura pairs you with <strong className="text-stone-900">Category-Specific Lead Doctors</strong>. 
            You can appoint dedicated specialists for each area, or assign a dual-certified specialist for both skin and hair.
          </p>

          {patientUser?.fullName && (
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-full text-xs text-stone-700">
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span>Welcome, <strong className="text-stone-900">{patientUser.fullName}</strong></span>
            </div>
          )}
        </div>

        {/* 3 Category Assignment Status Cards */}
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
                    ? 'bg-white border-emerald-600 ring-2 ring-emerald-500/20 shadow-md'
                    : 'bg-white/80 border-stone-200 hover:border-stone-300 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <div className="p-2 rounded-2xl flex items-center space-x-2 bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <Icon className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold">{cat.shortLabel}</span>
                  </div>

                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center space-x-1">
                    <Check className="w-3 h-3 text-emerald-700" />
                    <span>Assigned</span>
                  </span>
                </div>

                <h3 className="text-sm font-bold text-stone-900 truncate">{cat.title}</h3>
                <p className="text-[10px] text-stone-500 line-clamp-1 mb-3">{cat.desc}</p>

                {/* Assigned Doctor Mini Preview */}
                <div className="p-2.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-base flex-shrink-0 shadow-2xs">
                    {assignedDoc?.photo || '👨‍⚕️'}
                  </div>
                  <div className="truncate flex-1">
                    <p className="text-xs font-bold text-stone-900 truncate">{assignedDoc?.fullName || 'Select Doctor'}</p>
                    <p className="text-[10px] text-emerald-700 font-mono truncate">{assignedDoc?.specialization || 'Clinical Specialist'}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Category Selector & Doctor Roster */}
        <div className="bg-white border border-stone-200/90 rounded-3xl p-5 sm:p-6 space-y-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-700 font-bold">Step 2 • Select Specialist</span>
                <span className="text-stone-400">•</span>
                <span className="text-xs font-bold text-stone-900">{currentCategoryObj?.title}</span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Choose the attending lead doctor who will oversee your {currentCategoryObj?.shortLabel.toLowerCase()} treatments.
              </p>
            </div>

            {/* Category Switcher Pills */}
            <div className="flex bg-stone-100 p-1 rounded-2xl border border-stone-200 self-start">
              {CLINICAL_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategoryTab(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeCategoryTab === cat.id
                      ? 'bg-emerald-600 text-white shadow-xs font-bold'
                      : 'text-stone-600 hover:text-stone-900'
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
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search specialists by name, hospital, or language…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:border-emerald-600 transition-all"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                showFilters ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-stone-50 border-stone-300 text-stone-700 hover:bg-stone-100'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>
          </div>

          {/* Expanded Filter Panel */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-stone-200">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase">Gender</label>
                <div className="flex gap-1.5">
                  {GENDER_FILTERS.map((g) => (
                    <button
                      key={g}
                      onClick={() => setGenderFilter(g)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                        genderFilter === g ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase">Experience</label>
                <div className="flex gap-1.5">
                  {EXP_FILTERS.map((ef) => (
                    <button
                      key={ef.value}
                      onClick={() => setExpFilter(ef.value)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                        expFilter === ef.value ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {ef.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase">Language</label>
                <select
                  value={langFilter}
                  onChange={(e) => setLangFilter(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1 text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-600"
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
                      ? 'bg-emerald-50/60 border-emerald-500 shadow-md ring-1 ring-emerald-500/30'
                      : 'bg-white border-stone-200 hover:border-stone-300 hover:shadow-2xs'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-center text-2xl shadow-2xs">
                          {doc.photo}
                        </div>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <h4 className="text-sm font-bold text-stone-900">{doc.fullName}</h4>
                            {doc.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />}
                          </div>
                          <p className="text-xs text-emerald-700 font-mono font-medium">{doc.specialization}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-amber-50 text-amber-800 text-[11px] font-bold font-mono border border-amber-200">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                        <span>{doc.rating}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 text-[10px]">
                      <span className="px-2 py-0.5 rounded-md bg-stone-50 border border-stone-200 text-stone-700 flex items-center space-x-1">
                        <Building2 className="w-3 h-3 text-stone-400" />
                        <span className="truncate max-w-[140px]">{doc.hospitalAffiliation.name}</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono font-bold">
                        {doc.yearsOfExperience} Yrs Exp
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-stone-50 border border-stone-200 text-stone-600">
                        {doc.languagesSpoken.slice(0, 2).join(', ')}
                      </span>
                    </div>

                    <p className="text-[11px] text-stone-600 leading-relaxed line-clamp-2">
                      {doc.bio}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-2 border-t border-stone-200">
                    <button
                      type="button"
                      onClick={() => handleAssignCategory(activeCategoryTab, doc.id)}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                        isAssignedToThisCategory
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-stone-50 hover:bg-stone-100 text-stone-800 border border-stone-300'
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
                          className="py-1.5 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[10px] font-bold text-emerald-800 transition-all flex items-center justify-center space-x-1 cursor-pointer"
                        >
                          <Zap className="w-3 h-3 text-emerald-600" />
                          <span>Both Skin & Hair</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAssignAllCategories(doc.id)}
                          className="py-1.5 px-2 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-[10px] font-bold text-amber-800 transition-all flex items-center justify-center space-x-1 cursor-pointer"
                        >
                          <Crown className="w-3 h-3 text-amber-600" />
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

        {/* Final Confirmation Bottom Bar */}
        <div className="bg-white border border-stone-200/90 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-sm font-bold text-stone-900">Review & Confirm Your Healthcare Team</h4>
            <p className="text-xs text-stone-500">
              Skin: <strong className="text-emerald-800">{getDoctorById(categoryAssignments.SKIN_CARE)?.fullName}</strong> • 
              Hair: <strong className="text-emerald-800">{getDoctorById(categoryAssignments.HAIR_CARE)?.fullName}</strong> • 
              General: <strong className="text-emerald-800">{getDoctorById(categoryAssignments.GENERAL_HEALTH)?.fullName}</strong>
            </p>
          </div>

          <button
            type="button"
            disabled={isConfirming}
            onClick={handleConfirmAll}
            className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
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
