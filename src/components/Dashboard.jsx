import React, { useState, useRef, useEffect } from 'react';
import { API_BASE } from '../api.js';
import dermAuraLogo from '../dermAuraLogoNoBG.png';
import HealthChatroom from './HealthChatroom';
import QuickSessionPhotoUpload from './QuickSessionPhotoUpload';
import DoctorSwitchModal from './DoctorSwitchModal';
import LeadDoctorApprovalPanel from './LeadDoctorApprovalPanel';
import PatientRemindersDashboard from './PatientRemindersDashboard';
import PatientProfilePage from './PatientProfilePage';
import {
  MessageSquare,
  Scan,
  Calendar,
  FileText,
  PhoneCall,
  LogOut,
  Plus,
  Send,
  Paperclip,
  Mic,
  Sparkles,
  Bot,
  User,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  PanelLeft,
  ShieldCheck,
  Activity,
  CheckCircle2,
  Clock,
  ExternalLink,
  Search,
  Trash2,
  AlertTriangle,
  ShoppingBag,
  Lock,
  Unlock,
  ShoppingCart,
  Filter,
  Check,
  Star,
  Info,
  ShieldAlert,
  Smile,
  Scissors,
  Moon,
  Sun,
  Settings,
  X,
  HeartPulse,
  Award,
  Target,
  Users,
  ArrowRight,
  Sparkle,
  UploadCloud,
  CheckCircle,
  FileSpreadsheet,
  Crown,
  Bell,
  Video
} from 'lucide-react';

export default function Dashboard({ user: initialUser, onLogout, onUpdateUser }) {
  const [patientUser, setPatientUser] = useState(() => {
    try {
      const saved = localStorage.getItem('dermaura_user');
      return saved ? JSON.parse(saved) : (initialUser || {});
    } catch (e) {
      return initialUser || {};
    }
  });

  useEffect(() => {
    if (initialUser) {
      setPatientUser((prev) => ({ ...prev, ...initialUser }));
    }
  }, [initialUser]);

  const user = patientUser;

  const handleDoctorSwitchSuccess = (transferSummary) => {
    const newDocName = transferSummary?.newDoctorName || 'Dr. Vikramaditya Sen';
    const newDocId = transferSummary?.newDoctorId || 'doc-dr-vikramaditya-sen';
    const switchedCategory = transferSummary?.category || 'SKIN_CARE';

    const currentLeadDocs = patientUser.leadDoctors && patientUser.leadDoctors.length > 0
      ? patientUser.leadDoctors
      : [
          { category: 'SKIN_CARE', doctorId: patientUser.primaryLeadDoctorId || 'demo-doc-101', doctorName: patientUser.primaryLeadDoctorName || 'Dr. Sarah Jenkins', status: 'ACTIVE' },
          { category: 'HAIR_CARE', doctorId: patientUser.primaryLeadDoctorId || 'demo-doc-101', doctorName: patientUser.primaryLeadDoctorName || 'Dr. Sarah Jenkins', status: 'ACTIVE' },
          { category: 'GENERAL_HEALTH', doctorId: 'doc-pcp-2', doctorName: 'Dr. Rajesh Kumar', status: 'ACTIVE' },
        ];

    const updatedLeadDocs = currentLeadDocs.map((ld) => {
      if (ld.category === switchedCategory) {
        return {
          ...ld,
          doctorId: newDocId,
          doctorName: newDocName,
          assignedAt: new Date().toISOString(),
          status: 'ACTIVE',
        };
      }
      return ld;
    });

    const updatedUser = {
      ...patientUser,
      leadDoctors: updatedLeadDocs,
      primaryLeadDoctorId: switchedCategory === 'SKIN_CARE' ? newDocId : patientUser.primaryLeadDoctorId || newDocId,
      primaryLeadDoctorName: switchedCategory === 'SKIN_CARE' ? newDocName : patientUser.primaryLeadDoctorName || newDocName,
    };

    setPatientUser(updatedUser);

    try {
      localStorage.setItem('dermaura_user', JSON.stringify(updatedUser));
    } catch (e) {}

    if (onUpdateUser) {
      onUpdateUser(updatedUser);
    }

    try {
      const savedMsgsStr = localStorage.getItem('dermaura_health_chatroom_messages');
      const existingMsgs = savedMsgsStr ? JSON.parse(savedMsgsStr) : [];
      const switchMsg = {
        id: `msg-switch-${Date.now()}`,
        sender: 'doctor',
        senderName: `${newDocName} (${switchedCategory.replace('_', ' ')} Lead Doctor)`,
        isLead: true,
        text: `🔄 CARE HANDOFF & DOCTOR SWITCH CONFIRMED: ${switchedCategory.replace('_', ' ')} lead care successfully transferred to ${newDocName}. Escrow balance of ₹${(transferSummary?.financialBreakdown?.amountTransferredToNewDoctor || 1800).toLocaleString('en-IN')} has been reallocated in escrow.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text'
      };
      localStorage.setItem('dermaura_health_chatroom_messages', JSON.stringify([...existingMsgs, switchMsg]));
    } catch (e) {}

    setDoctorSwitchModalOpen(false);
    setBookingToast(`Doctor switched to ${newDocName} for ${switchedCategory.replace('_', ' ')}! Lead PCP updated in your profile and chatroom.`);
    setTimeout(() => setBookingToast(null), 5000);
  };

  const [currentPage, setCurrentPage] = useState('chat'); // 'chat' | 'scan' | 'consultations' | 'records' | 'pharmacy' | 'emergency' | 'about'
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Profile & Theme State
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [showProfileDetailsModal, setShowProfileDetailsModal] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [doctorSwitchModalOpen, setDoctorSwitchModalOpen] = useState(false);

  // E-Commerce & Prescription State
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [pharmacyCategory, setPharmacyCategory] = useState('all'); // 'all' | 'facial' | 'hair' | 'rx' | 'otc'
  const [pharmacySearch, setPharmacySearch] = useState('');
  const [unlockRequestModalProduct, setUnlockRequestModalProduct] = useState(null);
  const [unlockRequestNote, setUnlockRequestNote] = useState('');
  const [selectedDoctorForUnlock, setSelectedDoctorForUnlock] = useState(
    user?.primaryLeadDoctorName || user?.primaryLeadDoctorId || 'Dr. Sarah Jenkins'
  );
  
  // Real-time synced doctor unlocks & chat requests via localStorage
  const [doctorUnlockedProducts, setDoctorUnlockedProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('dermaura_unlocked_products');
      return saved ? JSON.parse(saved) : ['p3', 'p4']; // default organic items or demo unlocks
    } catch (e) {
      return ['p3', 'p4'];
    }
  });

  // Real-time synced Doctor Duty Status
  const [doctorDutyStatus, setDoctorDutyStatus] = useState(() => {
    try {
      return localStorage.getItem('dermaura_doctor_duty_status') || 'online';
    } catch (e) {
      return 'online';
    }
  });

  useEffect(() => {
    const syncDoctorDutyStatus = () => {
      try {
        const saved = localStorage.getItem('dermaura_doctor_duty_status') || 'online';
        setDoctorDutyStatus(saved);
      } catch (e) {}
    };
    window.addEventListener('storage', syncDoctorDutyStatus);
    window.addEventListener('dermaura_duty_status_changed', syncDoctorDutyStatus);
    const interval = setInterval(syncDoctorDutyStatus, 1000);
    return () => {
      window.removeEventListener('storage', syncDoctorDutyStatus);
      window.removeEventListener('dermaura_duty_status_changed', syncDoctorDutyStatus);
      clearInterval(interval);
    };
  }, []);

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [sessionRequests, setSessionRequests] = useState(() => {
    try {
      const saved = localStorage.getItem('dermaura_session_requests');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    const syncRequests = () => {
      try {
        const saved = localStorage.getItem('dermaura_session_requests');
        if (saved) setSessionRequests(JSON.parse(saved));
      } catch (e) {}
    };
    window.addEventListener('storage', syncRequests);
    const interval = setInterval(syncRequests, 1000);
    return () => {
      window.removeEventListener('storage', syncRequests);
      clearInterval(interval);
    };
  }, []);

  // DermScan Visual AI State
  const [scanImagePreview, setScanImagePreview] = useState(null);
  const [scanPresetName, setScanPresetName] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanReport, setScanReport] = useState(null);
  const fileInputRef = useRef(null);

  // Tele-Consultation Booking State
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('10:30 AM');
  const [bookingToast, setBookingToast] = useState(null);
  const [consultationList, setConsultationList] = useState([
    { id: 'app-101', doctorName: 'Dr. Sarah Jenkins', specialty: 'Facial Dermatology', date: 'Yesterday', status: 'Completed', prescriptionIssued: true },
  ]);

  // Specialized Doctors Database
  const doctorTeam = [
    {
      id: 'd1',
      name: 'Dr. Sarah Jenkins, MD',
      role: 'Chief Facial Dermatologist',
      qualification: 'MD Dermatology (AIIMS Delhi), Fellowship in Dermatopathology',
      experience: '14+ Years Experience',
      hospital: 'AIIMS New Delhi & DermAura Clinical Board',
      specialties: ['Facial Acne & Rosacea', 'Inflammatory Skin Lesions', 'Melasma & Sun Damage'],
      image: '👩‍⚕️',
      bio: 'Pioneer in non-invasive facial diagnostic triage and clinical protocol validation for AI healthcare platforms.'
    },
    {
      id: 'd2',
      name: 'Dr. Rajesh Sharma, MD',
      role: 'Lead Trichologist & Scalp Specialist',
      qualification: 'MD Dermatology, Board Certified Hair Transplant Specialist',
      experience: '12+ Years Experience',
      hospital: 'Fortis Healthcare & DermAura Hair Advisory',
      specialties: ['Androgenetic Alopecia', 'Scalp Seborrheic Dermatitis', 'Hair Follicle Restoration'],
      image: '👨‍⚕️',
      bio: 'Dedicated researcher on scalp microbiota, hair loss patterns, and prescription minoxidil/finasteride clinical safety.'
    },
    {
      id: 'd3',
      name: 'Dr. Ananya Patel, MD',
      role: 'Cosmetic & Laser Dermatologist',
      qualification: 'MD Dermatology (KEM Mumbai), Diploma in Aesthetic Medicine',
      experience: '10+ Years Experience',
      hospital: 'Apollo Hospitals & DermAura Advisory',
      specialties: ['Facial Hyperpigmentation', 'Barrier Repair Chemistry', 'Photodermatology'],
      image: '👩‍⚕️',
      bio: 'Expert in facial skin barrier repair, prescription retinoid safety, and sun protection formulations.'
    },
    {
      id: 'd4',
      name: 'Dr. Vikramaditya Sen, MD, DM',
      role: 'Clinical Dermatopathologist',
      qualification: 'MD, DM Dermatopathology (PGIMER Chandigarh)',
      experience: '16+ Years Experience',
      hospital: 'Max Healthcare & SIH Clinical Panel',
      specialties: ['Lesion Triage', 'Cutaneous AI Validation', 'Prescription Approval Protocol'],
      image: '👨‍⚕️',
      bio: 'Supervises tele-consultation diagnostic workflows and prescription unlocking security for DermAura Pharmacy.'
    }
  ];

  // Products Database
  const products = [
    {
      id: 'p1',
      name: 'DermAura Hydrating Gentle Facial Moisturizer',
      category: 'Facial Skin Care',
      type: 'otc',
      isOrganic: false,
      price: 499,
      rating: 4.9,
      image: '🧴',
      description: 'Ceramide + Vitamin E daily repair formula for facial skin barrier & redness.',
      safetyWarning: 'Safe for all facial skin types, pregnancy, and sensitive skin.',
      tag: 'Doctor Approval Required'
    },
    {
      id: 'p2',
      name: 'Broad Spectrum Facial Mineral Sunscreen SPF 50+',
      category: 'Facial Sun Protection',
      type: 'otc',
      isOrganic: false,
      price: 650,
      rating: 4.8,
      image: '☀️',
      description: 'Non-comedogenic zinc oxide formula to prevent facial photo-aging & melasma.',
      safetyWarning: 'Hypoallergenic. Safe for pregnancy & nursing mothers.',
      tag: 'Doctor Approval Required'
    },
    {
      id: 'p3',
      name: 'Sulfate-Free Hair & Scalp Strengthening Shampoo',
      category: 'Hair & Scalp Care',
      type: 'otc',
      isOrganic: true,
      price: 599,
      rating: 4.7,
      image: '🧴',
      description: 'Infused with Organic Aloe Vera & Argan Oil to nourish hair follicles and prevent scalp irritation.',
      safetyWarning: '100% Organic formula. Safe for sensitive scalp and allergy-prone hair.',
      tag: '100% Organic 🌿'
    },
    {
      id: 'p4',
      name: '100% Organic Soothing Aloe Facial & Scalp Gel',
      category: 'Facial & Scalp Care',
      type: 'otc',
      isOrganic: true,
      price: 299,
      rating: 4.9,
      image: '🌱',
      description: 'Cooling relief for facial redness, sunburn, and dry scalp itching.',
      safetyWarning: 'Pure organic extract. Safe for all ages & pregnancy.',
      tag: '100% Organic 🌿'
    },
    {
      id: 'p5',
      name: 'Hydrocortisone 1% Facial Dermatitis Cream',
      category: 'Prescription Facial Medicine',
      type: 'prescription',
      isOrganic: false,
      price: 340,
      rating: 4.9,
      image: '💊',
      description: 'Clinical relief for facial eczema, localized rosacea flare-ups, and intense itching.',
      safetyWarning: '⚠️ Doctor Prescription Required: Avoid if suffering from active facial viral/fungal skin infections.',
      tag: 'Prescription Rx 🔒'
    },
    {
      id: 'p6',
      name: 'Tretinoin 0.05% Facial Acne & Retinoid Gel',
      category: 'Prescription Facial Medicine',
      type: 'prescription',
      isOrganic: false,
      price: 890,
      rating: 4.8,
      image: '🧪',
      description: 'Targeted retinoid treatment for persistent facial acne vulgaris and hyperpigmentation.',
      safetyWarning: '⚠️ Doctor Prescription Required: Strictly avoid during pregnancy or planning to conceive.',
      tag: 'Prescription Rx 🔒'
    },
    {
      id: 'p7',
      name: 'Minoxidil 5% Hair & Scalp Regrowth Solution',
      category: 'Hair & Scalp Rx',
      type: 'prescription',
      isOrganic: false,
      price: 1150,
      rating: 4.7,
      image: '💧',
      description: 'Targeted hair follicle revitalizer for scalp hair loss and androgenetic alopecia.',
      safetyWarning: '⚠️ Doctor Prescription Required: Avoid if pregnant, breastfeeding, or suffering from hypertension.',
      tag: 'Prescription Rx 🔒'
    },
    {
      id: 'p8',
      name: 'Ketoconazole 2% Scalp Anti-Dandruff Solution',
      category: 'Hair & Scalp Rx',
      type: 'prescription',
      isOrganic: false,
      price: 420,
      rating: 4.9,
      image: '🧴',
      description: 'Medical antifungal scalp application for severe seborrheic dermatitis & stubborn dandruff.',
      safetyWarning: '⚠️ Doctor Prescription Required: Avoid if allergic to azole antifungals. Consult doctor during 1st trimester.',
      tag: 'Prescription Rx 🔒'
    }
  ];

  // Filtered Products for Pharmacy
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(pharmacySearch.toLowerCase()) || p.description.toLowerCase().includes(pharmacySearch.toLowerCase());
    if (!matchesSearch) return false;
    if (pharmacyCategory === 'facial') return p.category.toLowerCase().includes('facial');
    if (pharmacyCategory === 'hair') return p.category.toLowerCase().includes('hair') || p.category.toLowerCase().includes('scalp');
    if (pharmacyCategory === 'rx') return p.type === 'prescription';
    if (pharmacyCategory === 'otc') return p.type === 'otc';
    if (pharmacyCategory === 'organic') return p.isOrganic;
    return true;
  });

  // Chatbot State
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: `Hello ${user.fullName}! I am DermAura AI, specialized exclusively in **Facial Skin** and **Hair/Scalp Dermatology**. How can I assist you with your facial skin or hair concern today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { id: 'c1', title: 'Facial Acne & Redness Check', date: 'Today' },
    { id: 'c2', title: 'Scalp Hair Loss Assessment', date: 'Yesterday' },
    { id: 'c3', title: 'Facial Sunscreen Recommendation', date: '3 days ago' },
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const addToCart = (product) => {
    const isOrganic = Boolean(product.isOrganic);
    const isUnlocked = doctorUnlockedProducts.includes(product.id);
    if (!isOrganic && !isUnlocked) {
      setBookingToast(`🔒 "${product.name}" is locked. Patients can only purchase Organic products or Doctor-Unlocked items.`);
      setTimeout(() => setBookingToast(null), 4000);
      return;
    }
    setCart((prev) => [...prev, product]);
  };

  const removeFromCart = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

  // Markdown Formatter Helper
  const renderFormattedText = (text) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold text-teal-300">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const handleSendMessage = (textToSend) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setIsTyping(true);

    setTimeout(() => {
      let aiText = "Thank you for sharing your facial skin or hair concern. As an AI specialized in facial dermatology and hair health, I recommend keeping facial skin hydrated with fragrance-free moisturizers and using mineral sunscreens. You can also upload a clear face or scalp photo in our **DermScan Visual AI** tool!";
      
      const lower = query.toLowerCase();
      if (lower.includes('acne') || lower.includes('pimple') || lower.includes('face') || lower.includes('rosacea')) {
        aiText = `For facial acne or redness, wash your face twice daily with a non-comedogenic cleanser and apply a gentle ceramide facial moisturizer. For persistent facial acne, a dermatologist may prescribe **Tretinoin (0.05%)** available in our **DermPharmacy** store!`;
      } else if (lower.includes('hair') || lower.includes('scalp') || lower.includes('dandruff') || lower.includes('alopecia')) {
        aiText = `For scalp health and hair loss concerns, ensure your scalp is free of severe seborrheic dermatitis. **Minoxidil (5%)** or **Ketoconazole scalp solutions** are effective prescription options unlocked after a doctor consultation!`;
      } else if (lower.includes('doctor') || lower.includes('appointment') || lower.includes('consult')) {
        aiText = `I can connect you with certified dermatologists specializing in facial skin and hair care. Once your doctor evaluates your case, your prescription medicines in **DermPharmacy** will be unlocked!`;
      }

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: aiText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1200);
  };

  const handleNewChat = () => {
    setMessages([
      {
        id: Date.now(),
        sender: 'ai',
        text: `New consultation session started. What facial skin or hair/scalp query can I help you with, ${user.fullName}?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setCurrentPage('chat');
  };

  // Stress & Cortisol Quiz State
  const [stressAnswers, setStressAnswers] = useState({});
  const [stressResult, setStressResult] = useState(null);
  const [stressSharedWithDoctor, setStressSharedWithDoctor] = useState(false);

  const stressQuestions = [
    {
      id: 'q1',
      question: '1. How frequently do you experience sleep disruption or insomnia?',
      options: [
        { label: 'Rarely / Waking up refreshed', pts: 0 },
        { label: 'Occasional (1-2 nights a week)', pts: 2 },
        { label: 'Frequent (3-4 nights a week)', pts: 3 },
        { label: 'Chronic (Almost every night)', pts: 4 }
      ]
    },
    {
      id: 'q2',
      question: '2. How often do you feel under intense mental pressure or anxiety?',
      options: [
        { label: 'Rarely / Well managed', pts: 0 },
        { label: 'Moderate deadline pressure', pts: 2 },
        { label: 'High workload & frequent stress', pts: 3 },
        { label: 'Overwhelming constant pressure', pts: 4 }
      ]
    },
    {
      id: 'q3',
      question: '3. Do your facial skin breakouts or scalp itching flare during stressful weeks?',
      options: [
        { label: 'No noticeable correlation', pts: 0 },
        { label: 'Mild increase in redness or oiliness', pts: 2 },
        { label: 'Noticeable acne papules or scalp flaking', pts: 3 },
        { label: 'Severe acute skin outbreaks & hair shedding', pts: 4 }
      ]
    },
    {
      id: 'q4',
      question: '4. How much daily time do you dedicate to relaxation, exercise, or mindfulness?',
      options: [
        { label: 'Over 45 minutes daily', pts: 0 },
        { label: '20 to 45 minutes daily', pts: 1 },
        { label: 'Under 15 minutes daily', pts: 3 },
        { label: 'Almost 0 minutes (Constant hustle)', pts: 4 }
      ]
    },
    {
      id: 'q5',
      question: '5. Do you experience physical fatigue, tension headaches, or jaw clenching?',
      options: [
        { label: 'Never or rarely', pts: 0 },
        { label: 'Occasionally after long work days', pts: 1 },
        { label: 'Frequently during stressful periods', pts: 3 },
        { label: 'Daily physical exhaustion & tension', pts: 4 }
      ]
    }
  ];

  const handleSelectStressOption = (qId, pts) => {
    setStressAnswers((prev) => ({ ...prev, [qId]: pts }));
  };

  const handleCalculateStressScore = () => {
    let total = 0;
    Object.values(stressAnswers).forEach((val) => {
      total += val;
    });

    const maxPts = 20;
    const percentage = Math.round((total / maxPts) * 100);

    let category = 'Low Stress (Balanced Cortisol)';
    let badgeColor = 'bg-emerald-950 text-emerald-300 border-emerald-800';
    let summary = 'Your neuro-endocrine stress level is optimal. Low risk of stress-induced facial acne or scalp flares.';
    let recommendations = [
      'Maintain your current healthy sleep and hydration routine.',
      'Continue using gentle non-comedogenic skincare products.'
    ];

    if (percentage > 65) {
      category = 'High Cortisol Flare Risk (High Stress)';
      badgeColor = 'bg-rose-950 text-rose-300 border-rose-800';
      summary = 'Elevated systemic stress detected. High clinical correlation with inflammatory facial acne papules, scalp seborrheic flares, and hair shedding.';
      recommendations = [
        'Prioritize 7-8 hours of uninterrupted sleep to regulate serum cortisol.',
        'Share this report with your DermAura Dermatologist for targeted anti-inflammatory skincare advice.',
        'Incorporate 15 minutes of mindfulness or light evening walks.'
      ];
    } else if (percentage > 30) {
      category = 'Moderate Cortisol Elevation (Moderate Stress)';
      badgeColor = 'bg-amber-950 text-amber-300 border-amber-800';
      summary = 'Mild to moderate stress elevation. Cortisol spikes may trigger T-zone facial sebum overproduction and scalp itching.';
      recommendations = [
        'Monitor facial skin oiliness during intense work deadlines.',
        'Consider gentle salicylic acid or niacinamide cleansers.'
      ];
    }

    const detailedAnswers = stressQuestions.map((q) => {
      const selectedPts = stressAnswers[q.id];
      const selectedOpt = q.options.find((opt) => opt.pts === selectedPts);
      return {
        id: q.id,
        question: q.question,
        selectedOption: selectedOpt ? selectedOpt.label : 'Not Answered',
        pts: selectedPts !== undefined ? selectedPts : 0
      };
    });

    const res = {
      score: total,
      maxPts: 20,
      percentage: percentage,
      category: category,
      badgeColor: badgeColor,
      summary: summary,
      recommendations: recommendations,
      detailedAnswers: detailedAnswers,
      timestamp: new Date().toLocaleDateString()
    };

    setStressResult(res);
  };

  // ── AUTO-ROUTING HELPER ──────────────────────────────────────────────────
  // Fires POST /api/reports/analyze and simultaneously writes to localStorage
  // so AutoReportBanner in the doctor's portal picks it up instantly (demo mode).
  const autoRouteReportToDoctor = async (reportType, reportData, imageUrl = '') => {
    const patientId    = user.id || user._id || 'demo-patient-001';
    const leadDoctorId = user.primaryLeadDoctorId || 'demo-doctor-002';
    const snapshot     = { fullName: user.fullName || 'Patient', age: user.age || 28, gender: user.gender || 'Male' };

    const payload = { reportType, patientId, leadDoctorId, reportData: { ...reportData, scanImageUrl: imageUrl }, patientSnapshot: snapshot };

    // Write to localStorage immediately for demo-mode cross-tab sync
    try {
      const lsKey = reportType === 'DERMSCAN' ? 'dermaura_auto_scan_report' : 'dermaura_shared_stress_report';
      const lsPayload = { id: `${reportType}-${Date.now()}`, ...reportData, scanImageUrl: imageUrl, patientSnapshot: snapshot, deliveredAt: new Date().toISOString() };
      localStorage.setItem(lsKey, JSON.stringify(lsPayload));
    } catch (_) {}

    // Also fire the API route (non-blocking)
    try {
      await fetch(`${API_BASE}/api/reports/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (_) {
      // Silent fail — localStorage sync already handled demo mode
    }
  };

  const handleShareStressReportWithDoctor = async () => {
    if (!stressResult) return;
    setStressSharedWithDoctor(true);
    const sharedData = {
      patientName: user.fullName || 'Patient',
      patientEmail: user.email,
      ...stressResult,
      sharedAt: new Date().toLocaleTimeString()
    };
    localStorage.setItem('dermaura_shared_stress_report', JSON.stringify(sharedData));
    // Auto-route to doctor portal
    await autoRouteReportToDoctor('STRESS', stressResult);
    setBookingToast(`🤖 Stress Assessment auto-routed to your Lead Doctor! (${stressResult.percentage}% — ${stressResult.category})`);
    setTimeout(() => setBookingToast(null), 5000);
  };

  // DermScan File Upload Handler
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setScanPresetName(file.name);
      const url = URL.createObjectURL(file);
      setScanImagePreview(url);
      setScanReport(null);
    }
  };

  const handlePresetSelect = (presetType) => {
    setScanReport(null);
    if (presetType === 'acne') {
      setScanPresetName('Facial Acne Vulgaris Sample');
      setScanImagePreview('https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600&auto=format&fit=crop&q=60');
    } else if (presetType === 'scalp') {
      setScanPresetName('Seborrheic Scalp Dermatitis Sample');
      setScanImagePreview('https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=60');
    }
  };

  const executeImageScan = () => {
    if (!scanImagePreview) return;
    setIsScanning(true);
    setScanProgress(10);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 100;
        }
        return prev + 25;
      });
    }, 300);

    setTimeout(async () => {
      setIsScanning(false);
      setScanProgress(0);

      let report;
      if (scanPresetName.includes('Scalp') || scanPresetName.includes('Dandruff')) {
        report = {
          condition: 'Seborrheic Scalp Dermatitis & Follicular Inflammation',
          confidence: '96.2%',
          severity: 'Moderate',
          affectedArea: 'Scalp Vertex & Hairline',
          summary: 'Visual spectrum neural net detected localized fungal scalp micro-flora overgrowth causing flaking and erythema.',
          recommendations: [
            'Apply Ketoconazole 2% Scalp Solution twice weekly.',
            'Use Sulfate-Free Hair & Scalp Strengthening Shampoo for daily washing.',
            'Avoid harsh hot water scalp rinses.'
          ],
          recommendedRxId: 'p8',
          scanType: 'SCALP',
        };
      } else {
        report = {
          condition: 'Facial Acne Vulgaris & Inflammatory Papules',
          confidence: '95.4%',
          severity: 'Moderate',
          affectedArea: 'Malar Cheeks & Chin',
          summary: 'Micro-comedones and superficial follicular occlusion detected on facial T-zone.',
          recommendations: [
            'Wash face twice daily with non-comedogenic cleanser.',
            'Apply DermAura Hydrating Gentle Facial Moisturizer.',
            'Consult dermatologist for Tretinoin 0.05% prescription gel.'
          ],
          recommendedRxId: 'p6',
          scanType: 'FACIAL',
        };
      }

      setScanReport(report);

      // ── AUTO-ROUTE to Lead Doctor portal immediately ──────────────────────
      await autoRouteReportToDoctor('DERMSCAN', report, scanImagePreview || '');
      setBookingToast('🤖 AI DermScan auto-routed to your Lead Doctor for clinical review!');
      setTimeout(() => setBookingToast(null), 5000);
    }, 1600);
  };

  // Appointment Booking Handler
  const handleConfirmBooking = () => {
    if (!selectedDoctorForBooking) return;
    const doc = selectedDoctorForBooking;
    
    setConsultationList((prev) => [
      {
        id: `app-${Date.now()}`,
        doctorName: doc.name,
        specialty: doc.role,
        date: bookingDate || 'Tomorrow',
        time: bookingTime,
        status: 'Scheduled',
        prescriptionIssued: true,
      },
      ...prev,
    ]);

    setHasDoctorPrescription(true);
    setSelectedDoctorForBooking(null);
    setBookingToast(`Appointment successfully booked with ${doc.name}! Prescription medicines in DermPharmacy are now UNLOCKED 🔓`);
    setTimeout(() => setBookingToast(null), 6000);
  };

  return (
    <div className={`flex h-screen w-screen ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-stone-50 text-stone-900'} font-sans overflow-hidden selection:bg-emerald-500 selection:text-white transition-colors duration-300`}>
      
      {/* 1. CHATGPT-STYLE COLLAPSIBLE SIDEBAR */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 ${darkMode ? 'bg-slate-900/95 border-slate-800' : 'bg-white border-stone-200'} border-r flex flex-col justify-between z-[60] relative shadow-xs h-full flex-shrink-0`}>
        
        {/* Floating Expand Sidebar Button when Collapsed (z-[100] on sidebar right border) */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            title="Expand Sidebar"
            className="absolute -right-3.5 top-4 z-[100] w-7 h-7 rounded-full bg-emerald-600 hover:bg-emerald-700 border-white text-white border-2 shadow-md flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all group"
          >
            <ChevronRight className="w-4 h-4 text-white" />
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-stone-900 border border-stone-700 text-stone-100 text-xs font-semibold rounded-xl shadow-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 z-[100] whitespace-nowrap">
              <span>Expand Sidebar</span>
            </div>
          </button>
        )}

        <div className="flex flex-col h-full justify-between overflow-y-auto custom-scrollbar">
          {/* Top Logo & Name */}
          <div className="p-3.5 flex items-center justify-between border-b border-stone-200/80 min-h-[57px]">
            {sidebarOpen ? (
              <>
                <button
                  onClick={() => setCurrentPage('about')}
                  title="About DermAura Platform & Medical Team"
                  className="flex items-center space-x-2.5 text-left group hover:opacity-95 transition-all cursor-pointer"
                >
                  <img
                    src={dermAuraLogo}
                    alt="DermAura Logo"
                    className="w-8 h-8 object-contain drop-shadow-xs group-hover:scale-105 transition-transform flex-shrink-0"
                  />
                  <div>
                    <span className="font-extrabold text-base tracking-tight text-stone-900 block group-hover:text-emerald-700 transition-colors">
                      Derm<span className="text-emerald-600">Aura</span>
                    </span>
                    <span className="text-[9px] text-emerald-700 font-mono block">Facial & Hair AI • About</span>
                  </div>
                </button>

                <button
                  onClick={() => setSidebarOpen(false)}
                  title="Collapse Sidebar"
                  className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 transition-all cursor-pointer hover:scale-105"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="w-full flex items-center justify-center">
                <div className="relative group">
                  <button
                    onClick={() => setCurrentPage('about')}
                    title="About DermAura Platform"
                    className="w-8 h-8 flex items-center justify-center group hover:scale-105 transition-transform flex-shrink-0 cursor-pointer"
                  >
                    <img
                      src={dermAuraLogo}
                      alt="DermAura Logo"
                      className="w-8 h-8 object-contain drop-shadow-xs"
                    />
                  </button>
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-stone-900 border border-stone-700 text-stone-100 text-xs font-semibold rounded-xl shadow-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 z-[80] whitespace-nowrap flex items-center space-x-1.5">
                    <img src={dermAuraLogo} alt="Logo" className="w-3.5 h-3.5 object-contain inline-block" />
                    <span>About DermAura Platform</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* New Chat Button */}
          <div className="p-3 relative group">
            <button
              onClick={handleNewChat}
              title="New Consultation"
              className="w-full py-2.5 px-3 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-semibold flex items-center transition-all shadow-2xs cursor-pointer justify-start space-x-2.5"
            >
              <Plus className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              {sidebarOpen && <span>New Consultation</span>}
            </button>
            {!sidebarOpen && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-stone-900 border border-stone-700 text-stone-100 text-xs font-semibold rounded-xl shadow-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 whitespace-nowrap flex items-center space-x-1.5">
                <Plus className="w-3.5 h-3.5 text-emerald-600" />
                <span>New Consultation</span>
              </div>
            )}
          </div>

          {/* Navigation Items */}
          <div className="px-2 py-2 space-y-1">
            <div className="relative group">
              <button
                onClick={() => setCurrentPage('chat')}
                title="AI Health Chatbot"
                className={`w-full py-2 px-3 rounded-xl text-xs font-medium flex items-center ${
                  sidebarOpen ? 'justify-start space-x-3' : 'justify-center'
                } transition-all cursor-pointer ${
                  currentPage === 'chat'
                    ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-300 shadow-2xs'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <MessageSquare className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                {sidebarOpen && <span>AI Health Chatbot</span>}
              </button>
              {!sidebarOpen && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-stone-900 border border-stone-700 text-stone-100 text-xs font-semibold rounded-xl shadow-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 whitespace-nowrap flex items-center space-x-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>AI Health Chatbot</span>
                </div>
              )}
            </div>

            <div className="relative group">
              <button
                onClick={() => setCurrentPage('doctor-chat')}
                title="Doctor Tele-Chatroom"
                className={`w-full py-2 px-3 rounded-xl text-xs font-medium flex items-center ${
                  sidebarOpen ? 'justify-start space-x-3' : 'justify-center'
                } transition-all cursor-pointer ${
                  currentPage === 'doctor-chat'
                    ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-300 shadow-2xs'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <Stethoscope className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                {sidebarOpen && (
                  <div className="flex items-center justify-between w-full">
                    <span>Doctor Chatroom</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                      Live
                    </span>
                  </div>
                )}
              </button>
              {!sidebarOpen && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-stone-900 border border-stone-700 text-stone-100 text-xs font-semibold rounded-xl shadow-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 whitespace-nowrap flex items-center space-x-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Doctor Tele-Chatroom</span>
                </div>
              )}
            </div>

            {/* Care & Reminders Portal */}
            <div className="relative group">
              <button
                onClick={() => setCurrentPage('reminders')}
                title="Care & Medication Adherence"
                className={`w-full py-2 px-3 rounded-xl text-xs font-medium flex items-center ${
                  sidebarOpen ? 'justify-start space-x-3' : 'justify-center'
                } transition-all cursor-pointer ${
                  currentPage === 'reminders'
                    ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-300 shadow-2xs'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                {sidebarOpen && (
                  <div className="flex items-center justify-between w-full">
                    <span>Care & Adherence</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                      Doses
                    </span>
                  </div>
                )}
              </button>
            </div>

            {/* Quick Pre-Consultation Assessment */}
            <div className="relative group">
              <button
                onClick={() => setCurrentPage('pre-consult')}
                title="Instant 24-Hr Session (₹300)"
                className={`w-full py-2 px-3 rounded-xl text-xs font-medium flex items-center ${
                  sidebarOpen ? 'justify-start space-x-3' : 'justify-center'
                } transition-all cursor-pointer ${
                  currentPage === 'pre-consult'
                    ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-300 shadow-2xs'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <Sparkles className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                {sidebarOpen && (
                  <div className="flex items-center justify-between w-full">
                    <span>24-Hr Assessment</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                      ₹300
                    </span>
                  </div>
                )}
              </button>
            </div>

            <div className="relative group">
              <button
                onClick={() => setCurrentPage('pharmacy')}
                title="DermPharmacy Store"
                className={`w-full py-2 px-3 rounded-xl text-xs font-medium flex items-center ${
                  sidebarOpen ? 'justify-start space-x-3' : 'justify-center'
                } transition-all cursor-pointer ${
                  currentPage === 'pharmacy'
                    ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-300 shadow-2xs'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <ShoppingBag className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                {sidebarOpen && (
                  <div className="flex items-center justify-between w-full">
                    <span>DermPharmacy</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                      Store
                    </span>
                  </div>
                )}
              </button>
              {!sidebarOpen && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-stone-900 border border-stone-700 text-stone-100 text-xs font-semibold rounded-xl shadow-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 whitespace-nowrap flex items-center space-x-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                  <span>DermPharmacy Store</span>
                </div>
              )}
            </div>

            <div className="relative group">
              <button
                onClick={() => setCurrentPage('scan')}
                title="DermScan Visual AI"
                className={`w-full py-2 px-3 rounded-xl text-xs font-medium flex items-center ${
                  sidebarOpen ? 'justify-start space-x-3' : 'justify-center'
                } transition-all cursor-pointer ${
                  currentPage === 'scan'
                    ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-300 shadow-2xs'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <Scan className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                {sidebarOpen && <span>DermScan Visual AI</span>}
              </button>
              {!sidebarOpen && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-stone-900 border border-stone-700 text-stone-100 text-xs font-semibold rounded-xl shadow-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 whitespace-nowrap flex items-center space-x-1.5">
                  <Scan className="w-3.5 h-3.5 text-emerald-600" />
                  <span>DermScan Visual AI</span>
                </div>
              )}
            </div>

            <div className="relative group">
              <button
                onClick={() => setCurrentPage('stress')}
                title="Stress & Cortisol Quiz"
                className={`w-full py-2 px-3 rounded-xl text-xs font-medium flex items-center ${
                  sidebarOpen ? 'justify-start space-x-3' : 'justify-center'
                } transition-all cursor-pointer ${
                  currentPage === 'stress'
                    ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-300 shadow-2xs'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <Activity className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                {sidebarOpen && (
                  <div className="flex items-center justify-between w-full">
                    <span>Stress & Cortisol Quiz</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                      Quiz
                    </span>
                  </div>
                )}
              </button>
              {!sidebarOpen && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-stone-900 border border-stone-700 text-stone-100 text-xs font-semibold rounded-xl shadow-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 whitespace-nowrap flex items-center space-x-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Stress & Cortisol Quiz</span>
                </div>
              )}
            </div>

            <div className="relative group">
              <button
                onClick={() => setCurrentPage('emergency')}
                title="Emergency Medical SOS"
                className={`w-full py-2 px-3 rounded-xl text-xs font-medium flex items-center ${
                  sidebarOpen ? 'justify-start space-x-3' : 'justify-center'
                } transition-all cursor-pointer ${
                  currentPage === 'emergency'
                    ? 'bg-rose-50 text-rose-800 font-bold border border-rose-300 shadow-2xs'
                    : 'text-rose-700 hover:bg-rose-50'
                }`}
              >
                <PhoneCall className="w-4 h-4 flex-shrink-0 text-rose-600" />
                {sidebarOpen && <span>Emergency SOS</span>}
              </button>
              {!sidebarOpen && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-rose-900 border border-rose-700 text-rose-100 text-xs font-semibold rounded-xl shadow-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 whitespace-nowrap flex items-center space-x-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-rose-400" />
                  <span>Emergency Medical SOS</span>
                </div>
              )}
            </div>
          </div>

          {/* Scope Badge */}
          {sidebarOpen && (
            <div className="mx-3 my-2 p-2.5 bg-stone-50 border border-emerald-200 rounded-xl text-[10px] space-y-1">
              <span className="text-emerald-800 font-bold flex items-center">
                <Smile className="w-3 h-3 mr-1 text-emerald-600" /> Facial & Hair AI Scope
              </span>
              <p className="text-stone-600 text-[9.5px]">Trained exclusively for facial skin & scalp health.</p>
            </div>
          )}

          {/* Recent Consultations Container */}
          {sidebarOpen && (
            <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-2 border-t border-stone-200 space-y-1">
              <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider block px-1 mb-1">
                Recent Consultations
              </span>
              {chatHistory.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setCurrentPage('chat')}
                  className="group flex items-center justify-between p-2 rounded-xl text-xs text-stone-600 hover:bg-stone-100 hover:text-stone-900 cursor-pointer transition-all"
                >
                  <span className="truncate pr-2">{chat.title}</span>
                  <span className="text-[10px] text-stone-400 group-hover:text-stone-600">{chat.date}</span>
                </div>
              ))}
            </div>
          )}

          {/* USER CARD & DIRECT WEBPAGE PROFILE TRIGGER */}
          <div className="p-3 border-t border-stone-200 bg-stone-50/80 relative group">
            <button
              onClick={() => setCurrentPage('profile')}
              title="View Profile"
              className="w-full flex items-center p-2 rounded-xl bg-white hover:bg-emerald-50 hover:border-emerald-300 cursor-pointer transition-all border border-stone-200/60 shadow-2xs text-left min-w-0 overflow-hidden"
            >
              <div className={`flex items-center min-w-0 w-full ${sidebarOpen ? 'space-x-2.5' : 'justify-center'}`}>
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-2xs">
                  {user.role === 'doctor' ? <Stethoscope className="w-4 h-4 text-emerald-700" /> : <User className="w-4 h-4 text-emerald-700" />}
                </div>
                {sidebarOpen && (
                  <div className="min-w-0 flex-1 overflow-hidden text-left">
                    <p className="text-xs font-bold text-stone-900 truncate leading-tight">{user.fullName}</p>
                    <p className="text-[10px] font-mono text-emerald-700 uppercase font-semibold truncate leading-tight mt-0.5">
                      {user.role === 'doctor' ? (user.specialization ? user.specialization.split('&')[0].trim() : 'Doctor') : 'Patient'} • Profile
                    </p>
                  </div>
                )}
              </div>
            </button>
            <div className="absolute left-full bottom-3 ml-3 px-2.5 py-1.5 bg-stone-900 border border-stone-700 text-stone-100 text-xs font-semibold rounded-xl shadow-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 whitespace-nowrap flex items-center space-x-1.5">
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span>View Profile</span>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. MAIN CANVAS CONTENT */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Toast Notification */}
        {bookingToast && (
          <div className="absolute top-16 right-6 z-[100] p-4 bg-emerald-950/95 border border-emerald-700/80 rounded-2xl shadow-2xl text-xs text-emerald-200 flex items-center space-x-3 max-w-md animate-in slide-in-from-top backdrop-blur-md">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>{bookingToast}</span>
          </div>
        )}

        {/* Top Header Bar */}
        <header className="h-14 border-b border-stone-200 bg-white/95 px-4 sm:px-6 flex items-center justify-between backdrop-blur-md relative z-50">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-semibold text-stone-500 hidden sm:inline">Model:</span>
            <span className="text-xs font-bold text-emerald-800 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-300 flex items-center space-x-1.5 shadow-2xs">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>DermAura Facial & Hair AI v2.4</span>
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Notification Bell Dropdown */}
            <div className="relative z-50">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-semibold flex items-center space-x-1.5 border border-stone-200 transition-all shadow-2xs cursor-pointer"
              >
                <Bell className="w-4 h-4 text-emerald-700" />
                <span className="hidden sm:inline">Notifications</span>
                {sessionRequests.length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {sessionRequests.length}
                  </span>
                )}
              </button>

              {/* Backdrop Listener to click outside notification */}
              {notificationsOpen && (
                <div
                  className="fixed inset-0 z-40 bg-stone-900/10 backdrop-blur-[1px]"
                  onClick={() => setNotificationsOpen(false)}
                />
              )}

              {/* Notification Drawer Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-white border border-stone-200 rounded-2xl shadow-xl p-4 z-[100] space-y-3 ring-1 ring-emerald-500/20 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                    <h4 className="text-xs font-bold text-stone-900 flex items-center space-x-2">
                      <Bell className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Notifications & Session Alerts</span>
                    </h4>
                    <button onClick={() => setNotificationsOpen(false)} className="text-stone-400 hover:text-stone-700 cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {sessionRequests.length === 0 ? (
                    <div className="text-center py-4 text-xs text-stone-500">
                      No active session requests or notifications.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                      {sessionRequests.map((req) => (
                        <div key={req.id} className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-stone-900 text-[11px]">24-Hr Assessment Request</span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                              req.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                            }`}>
                              {req.status === 'ACCEPTED' ? '🟢 ACCEPTED BY DOCTOR' : '⏳ PENDING ACCEPTANCE'}
                            </span>
                          </div>
                          <p className="text-stone-700 text-[11px]">
                            Scope: <strong className="text-emerald-800">{req.skinType || 'Skin & Hair'}</strong>
                          </p>
                          <p className="text-stone-500 text-[10px] truncate">
                            Complaint: {req.chiefComplaint}
                          </p>
                          {req.status === 'ACCEPTED' ? (
                            <button
                              onClick={() => {
                                setNotificationsOpen(false);
                                setCurrentPage('doctor-chat');
                              }}
                              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                            >
                              <Video className="w-3.5 h-3.5" />
                              <span>Join Meet & Live Tele-Consult 📹</span>
                            </button>
                          ) : (
                            <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-[10px] text-amber-900">
                              ⏳ Waiting for Doctor to accept request and start meet.
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Doctor Clinical Availability Status Badge */}
            <div
              onClick={() => setDoctorSwitchModalOpen(true)}
              title="Attending Lead Doctor Clinical Availability"
              className="hidden lg:flex items-center space-x-2 px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs cursor-pointer hover:border-stone-300 transition-all shadow-2xs"
            >
              <span className={`w-2.5 h-2.5 rounded-full ${
                doctorDutyStatus === 'online' ? 'bg-emerald-500 animate-pulse' : doctorDutyStatus === 'busy' ? 'bg-amber-500' : 'bg-rose-500'
              }`} />
              <span className="font-bold text-stone-900">
                {user.primaryLeadDoctorName || 'Dr. Sarah Jenkins'}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                doctorDutyStatus === 'online'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : doctorDutyStatus === 'busy'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-rose-100 text-rose-800 border border-rose-300'
              }`}>
                {doctorDutyStatus === 'online' ? '🟢 Online & Available' : doctorDutyStatus === 'busy' ? '🟡 Busy in Consultation' : '🔴 Off-Duty'}
              </span>
            </div>

            <button
              onClick={() => setDoctorSwitchModalOpen(true)}
              className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center space-x-1.5 border border-emerald-300 transition-all cursor-pointer shadow-2xs"
            >
              <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Switch Doctor (Escrow)</span>
            </button>

            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-semibold flex items-center space-x-2 border border-stone-200 transition-all cursor-pointer shadow-2xs"
            >
              <ShoppingCart className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Cart</span>
              {cart.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>

            <div className="flex items-center space-x-2 text-xs text-stone-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Encrypted Session</span>
            </div>
          </div>
        </header>

        {/* Dynamic Pages */}

        {/* PAGE: PATIENT PROFILE & NOTIFICATIONS WEBPAGE */}
        {currentPage === 'profile' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6">
            <PatientProfilePage
              user={user}
              onUpdateUser={(updated) => {
                setPatientUser(updated);
                try { localStorage.setItem('dermaura_user', JSON.stringify(updated)); } catch (e) {}
                if (onUpdateUser) onUpdateUser(updated);
              }}
              onLogout={onLogout}
              onNavigateToChat={() => setCurrentPage('doctor-chat')}
              onNavigateToSwitchDoctor={() => setDoctorSwitchModalOpen(true)}
            />
          </div>
        )}

        {/* PAGE: CARE & REMINDERS PORTAL */}
        {currentPage === 'reminders' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6">
            <div className="max-w-5xl mx-auto">
              <PatientRemindersDashboard patientId={user.id || 'pat-aarav-101'} />
            </div>
          </div>
        )}



        {/* PAGE: PRE-CONSULTATION ASSESSMENT */}
        {currentPage === 'pre-consult' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6">
            <div className="max-w-3xl mx-auto">
              <QuickSessionPhotoUpload
                patientId={user.id || 'pat-aarav-101'}
                leadDoctorId={user.primaryLeadDoctorId || 'doc-sarah-jenkins'}
                onSessionCreated={() => setCurrentPage('doctor-chat')}
                onCancel={() => setCurrentPage('chat')}
              />
            </div>
          </div>
        )}
        
        {/* PAGE 1: CHATBOT PAGE */}
        {currentPage === 'chat' && (
          <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] w-full overflow-hidden relative bg-stone-50">
            <div className="flex-1 overflow-y-auto custom-scrollbar w-full p-4 sm:p-6">
              <div className="max-w-3xl w-full mx-auto space-y-6">
                {messages.length <= 1 && (
                  <div className="py-10 text-center space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center font-bold text-emerald-800 mx-auto shadow-sm">
                      <Bot className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-stone-900">
                      What facial skin or hair query can I assist with today, <span className="text-emerald-700">{user.fullName}</span>?
                    </h2>
                    <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
                      DermAura AI is trained specifically for facial acne, rosacea, scalp health, and hair loss evaluation.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-4 max-w-lg mx-auto text-left">
                      <button
                        onClick={() => handleSendMessage('Check symptoms for facial acne, redness, and sensitive skin care')}
                        className="p-3 bg-white border border-stone-200 hover:border-emerald-400 hover:bg-emerald-50/30 rounded-2xl text-xs text-stone-700 transition-all flex items-start space-x-2.5 shadow-2xs cursor-pointer"
                      >
                        <Smile className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold block text-stone-900">Facial Skin & Acne Check</span>
                          <span className="text-[11px] text-stone-500">Rosacea, redness & facial care</span>
                        </div>
                      </button>

                      <button
                        onClick={() => handleSendMessage('Assess scalp health, hair thinning, and anti-dandruff solutions')}
                        className="p-3 bg-white border border-stone-200 hover:border-emerald-400 hover:bg-emerald-50/30 rounded-2xl text-xs text-stone-700 transition-all flex items-start space-x-2.5 shadow-2xs cursor-pointer"
                      >
                        <Scissors className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold block text-stone-900">Hair & Scalp Health</span>
                          <span className="text-[11px] text-stone-500">Hair loss & scalp seborrhea</span>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start space-x-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender === 'ai' && (
                      <div className="w-8 h-8 rounded-xl bg-emerald-100/80 border border-emerald-300 flex items-center justify-center text-emerald-700 font-bold text-xs flex-shrink-0 shadow-2xs">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div className={`max-w-lg rounded-2xl p-4 text-xs leading-relaxed space-y-1 shadow-2xs ${
                      msg.sender === 'user'
                        ? 'bg-emerald-600 text-white rounded-tr-none font-medium'
                        : 'bg-white border border-stone-200 text-stone-800 rounded-tl-none'
                    }`}>
                      <p className="whitespace-pre-wrap">{renderFormattedText(msg.text)}</p>
                      <span className="text-[10px] opacity-70 block text-right font-mono">{msg.timestamp}</span>
                    </div>

                    {msg.sender === 'user' && (
                      <div className="w-8 h-8 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-700 font-bold text-xs flex-shrink-0 shadow-2xs">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 font-bold text-xs shadow-2xs">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-white border border-stone-200 rounded-2xl px-4 py-3 text-xs text-stone-500 flex items-center space-x-1 shadow-2xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce delay-150" />
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce delay-300" />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 pt-2 pb-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="relative border border-stone-300 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/15 rounded-2xl p-2.5 shadow-sm transition-all bg-white"
              >
                <textarea
                  rows={2}
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Ask DermAura AI about facial skin or hair/scalp concerns (Press Enter to send)..."
                  className="w-full bg-transparent text-xs text-stone-900 placeholder-stone-400 focus:outline-none resize-none px-2"
                />

                <div className="flex items-center justify-between pt-1 px-1 border-t border-stone-100">
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => setCurrentPage('scan')}
                      title="Upload Face or Hair Image"
                      className="p-1.5 rounded-lg text-stone-500 hover:text-emerald-700 hover:bg-stone-100 transition-all cursor-pointer"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentPage('pharmacy')}
                      title="Open DermPharmacy Store"
                      className="p-1.5 rounded-lg text-stone-500 hover:text-emerald-700 hover:bg-stone-100 transition-all cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={!inputQuery.trim()}
                    className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-30 text-white font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* PAGE ABOUT DERMAURA & MEDICAL TEAM */}
        {currentPage === 'about' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 max-w-5xl mx-auto space-y-8 w-full bg-stone-50">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-stone-900 to-emerald-950 text-white p-8 shadow-md space-y-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
                <Sparkle className="w-3.5 h-3.5" />
                <span>Smart India Hackathon Healthcare Initiative</span>
              </div>

              <div className="flex items-center space-x-4">
                <img src={dermAuraLogo} alt="DermAura Logo" className="w-14 h-14 object-contain drop-shadow-xl" />
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                  About <span className="text-emerald-400">DermAura</span>
                </h1>
              </div>
              
              <p className="text-sm text-stone-200 max-w-2xl leading-relaxed">
                DermAura is an AI-driven, clinical-grade healthcare platform designed exclusively for <strong>Facial Skin Lesions</strong> and <strong>Hair/Scalp Dermatology</strong>. Built for the Smart India Hackathon (SIH), our system bridges intelligent AI triage with certified tele-dermatologists and doctor-gated e-commerce.
              </p>

              <div className="pt-2">
                <button
                  onClick={() => setCurrentPage('chat')}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/30 flex items-center space-x-2 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <Bot className="w-4 h-4" />
                  <span>Launch DermAura AI Chatbot</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-emerald-600" />
                <h2 className="text-xl font-bold text-stone-900">Our Motive & Vision</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 bg-white border border-stone-200 rounded-2xl space-y-2 shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    <Smile className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-stone-900">Facial & Hair Specialization</h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Generic diagnostic tools fail on specialized skin textures. DermAura isolates facial dermatitis, rosacea, acne vulgaris, and scalp hair loss for maximal clinical precision.
                  </p>
                </div>

                <div className="p-5 bg-white border border-stone-200 rounded-2xl space-y-2 shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-stone-900">Doctor-Gated E-Commerce</h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Preventing dangerous self-medication. Prescription items like Tretinoin and Minoxidil remain strictly locked until validated by certified dermatologists.
                  </p>
                </div>

                <div className="p-5 bg-white border border-stone-200 rounded-2xl space-y-2 shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    <Award className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-stone-900">SIH Healthcare Innovation</h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Developed for Smart India Hackathon to democratize early dermatological triage across rural and urban India with instant AI diagnostics and tele-consults.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-xl font-bold text-stone-900">Meet Our Specialized Medical Team</h2>
                </div>
                <span className="text-xs font-mono text-stone-500">Certified Panel</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {doctorTeam.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-5 bg-white border border-stone-200 hover:border-emerald-400 rounded-3xl space-y-3 transition-all shadow-xs flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start space-x-4">
                        <div className="w-14 h-14 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-center text-3xl shadow-2xs flex-shrink-0">
                          {doc.image}
                        </div>
                        <div>
                          <span className="text-[10px] font-mono text-emerald-700 uppercase tracking-wider block font-bold">
                            {doc.role}
                          </span>
                          <h3 className="text-base font-bold text-stone-900">{doc.name}</h3>
                          <p className="text-xs text-stone-500">{doc.qualification}</p>
                          <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-700">
                            {doc.experience} • {doc.hospital}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-stone-600 leading-relaxed bg-stone-50 p-3 rounded-2xl border border-stone-200">
                        "{doc.bio}"
                      </p>

                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider block font-semibold">
                          Specializations:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {doc.specialties.map((spec, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-stone-200 flex items-center justify-between mt-3">
                      <span className="text-[11px] text-stone-500 font-medium">Certified DermAura Specialist</span>
                      <button
                        onClick={() => setDoctorSwitchModalOpen(true)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                      >
                        Switch to This Doctor
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 bg-white border border-stone-200 rounded-3xl text-center space-y-4 shadow-sm">
              <Bot className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="text-xl font-extrabold text-stone-900">Ready for your instant facial or hair diagnostic check?</h3>
              <p className="text-xs text-stone-600 max-w-md mx-auto">
                Consult with DermAura AI right now or book a session with our panel of facial & hair dermatologists.
              </p>
              <button
                onClick={() => setCurrentPage('chat')}
                className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-emerald-600/20 inline-flex items-center space-x-2 transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <Bot className="w-4 h-4" />
                <span>Go to DermAura AI Chatbot</span>
              </button>
            </div>

          </div>
        )}

        {/* PAGE 1.5: DOCTOR TELE-CHATROOM */}
        {currentPage === 'doctor-chat' && (
          <HealthChatroom
            role="patient"
            currentUser={user}
            onNavigate={(page) => setCurrentPage(page)}
          />
        )}

        {/* PAGE 2: DERMPHARMACY STORE */}
        {currentPage === 'pharmacy' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 max-w-6xl mx-auto space-y-6 w-full bg-stone-50">
            <div className="p-6 rounded-3xl bg-white border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
              <div>
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-2">
                  <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Facial & Hair Medical E-Commerce</span>
                </div>
                <h2 className="text-2xl font-black text-stone-900">Facial & Hair Care Pharmacy</h2>
                <p className="text-xs text-stone-600 mt-1 max-w-xl">
                  Doctor-Gated Medical Security: Patients can purchase <strong>100% Organic</strong> products directly, or items explicitly <strong>Unlocked / Recommended by certified doctors</strong>.
                </p>
              </div>

              <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-2 text-xs max-w-md">
                <div className="flex items-center space-x-2 text-emerald-800 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Clinical E-Commerce Security Active</span>
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  Non-organic & prescription items are locked by default. To purchase a locked product, send an unlock request message to your doctor in chat.
                </p>
              </div>
            </div>

            {/* Category Filter Tabs & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-stone-200 shadow-2xs">
              <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
                <button
                  onClick={() => setPharmacyCategory('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    pharmacyCategory === 'all' ? 'bg-emerald-600 text-white font-bold shadow-2xs' : 'bg-stone-50 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  All Products
                </button>
                <button
                  onClick={() => setPharmacyCategory('organic')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    pharmacyCategory === 'organic' ? 'bg-emerald-600 text-white font-bold shadow-2xs' : 'bg-stone-50 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  🌿 Organic Only
                </button>
                <button
                  onClick={() => setPharmacyCategory('facial')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    pharmacyCategory === 'facial' ? 'bg-emerald-600 text-white font-bold shadow-2xs' : 'bg-stone-50 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  Facial Skin Care
                </button>
                <button
                  onClick={() => setPharmacyCategory('hair')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    pharmacyCategory === 'hair' ? 'bg-emerald-600 text-white font-bold shadow-2xs' : 'bg-stone-50 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  Hair & Scalp
                </button>
                <button
                  onClick={() => setPharmacyCategory('rx')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    pharmacyCategory === 'rx' ? 'bg-emerald-600 text-white font-bold shadow-2xs' : 'bg-stone-50 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  Prescription Rx
                </button>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={pharmacySearch}
                  onChange={(e) => setPharmacySearch(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pb-6">
              {filteredProducts.map((product) => {
                const isOrganic = Boolean(product.isOrganic);
                const isUnlocked = doctorUnlockedProducts.includes(product.id);
                const isBuyable = isOrganic || isUnlocked;

                return (
                  <div
                    key={product.id}
                    className={`relative bg-white border rounded-3xl p-5 flex flex-col justify-between transition-all ${
                      !isBuyable ? 'border-stone-200/80 bg-stone-50/50' : 'border-stone-200 hover:border-emerald-500 shadow-xs'
                    }`}
                  >
                    {isOrganic ? (
                      <div className="absolute top-3 right-3 px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-[10px] font-mono font-bold flex items-center space-x-1 z-10">
                        <Check className="w-3 h-3 text-emerald-700" />
                        <span>Organic 🌿</span>
                      </div>
                    ) : isUnlocked ? (
                      <div className="absolute top-3 right-3 px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-[10px] font-mono font-bold flex items-center space-x-1 z-10 shadow-2xs">
                        <Unlock className="w-3 h-3 text-emerald-700" />
                        <span>Doctor Unlocked 🔓</span>
                      </div>
                    ) : (
                      <div className="absolute top-3 right-3 px-2.5 py-1 bg-rose-100 text-rose-800 border border-rose-300 rounded-full text-[10px] font-mono font-bold flex items-center space-x-1 z-10 shadow-2xs">
                        <Lock className="w-3 h-3 text-rose-700" />
                        <span>Doctor Lock 🔒</span>
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="w-16 h-16 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-center text-3xl shadow-2xs mx-auto my-2">
                        {product.image}
                      </div>

                      <div>
                        <span className="text-[10px] font-mono uppercase text-stone-500 tracking-wider block font-semibold">
                          {product.category}
                        </span>
                        <h3 className="text-sm font-bold text-stone-900 line-clamp-1 mt-0.5">{product.name}</h3>
                        <p className="text-xs text-stone-600 mt-1 leading-relaxed line-clamp-2">{product.description}</p>
                      </div>

                      <div className={`p-2.5 rounded-xl border text-[10px] leading-relaxed ${
                        !isBuyable
                          ? 'bg-rose-50 border-rose-200 text-rose-800'
                          : isOrganic
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      }`}>
                        <span className="font-bold uppercase tracking-wider block flex items-center mb-0.5">
                          <ShieldAlert className="w-3 h-3 mr-1 flex-shrink-0 text-emerald-700" />
                          <span>Status & Safety Warning:</span>
                        </span>
                        <span>{product.safetyWarning}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-stone-200 mt-4 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-stone-500 block font-semibold">Price</span>
                        <span className="text-lg font-black text-stone-900">₹{product.price}</span>
                      </div>

                      {isBuyable ? (
                        <button
                          onClick={() => addToCart(product)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Add to Cart</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setUnlockRequestModalProduct(product);
                            setUnlockRequestNote(`Hello Doctor, I request clinical evaluation and prescription unlock for ${product.name}. Could you please check my profile and unlock this product for me?`);
                          }}
                          className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-semibold rounded-xl transition-all flex items-center space-x-1.5 shadow-2xs cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Ask Doctor to Unlock 💬</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PAGE 3: DERMSCAN VISUAL AI */}
        {currentPage === 'scan' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 max-w-4xl mx-auto space-y-6 w-full bg-stone-50">
            <div className="border-b border-stone-200 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-stone-900 flex items-center space-x-2">
                  <Scan className="w-5 h-5 text-emerald-600" />
                  <span>DermScan Facial & Hair AI Analyzer</span>
                </h2>
                <p className="text-xs text-stone-500">Trained exclusively for facial skin lesions and scalp/hair diagnostic triage.</p>
              </div>

              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-mono font-bold">
                SCOPE: FACE & HAIR
              </span>
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageFileChange}
              className="hidden"
            />

            {/* Presets & Dropzone */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Left Selector & Upload */}
              <div className="md:col-span-6 space-y-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-6 bg-white border-2 border-dashed border-stone-300 hover:border-emerald-500 rounded-3xl text-center space-y-3 cursor-pointer transition-all shadow-2xs"
                >
                  <UploadCloud className="w-10 h-10 text-emerald-600 mx-auto" />
                  <div>
                    <h3 className="text-sm font-bold text-stone-900">Click to Upload Face or Scalp Image</h3>
                    <p className="text-[11px] text-stone-500 mt-1">Supports PNG, JPG, WEBP (Max 10MB)</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
                    Or select sample test image:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handlePresetSelect('acne')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        scanPresetName.includes('Acne') ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-2xs' : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <Smile className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                      <span>Facial Acne</span>
                    </button>
                    <button
                      onClick={() => handlePresetSelect('scalp')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        scanPresetName.includes('Scalp') ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-2xs' : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <Scissors className="w-4 h-4 mx-auto mb-1 text-emerald-700" />
                      <span>Scalp Dandruff</span>
                    </button>
                  </div>
                </div>

                {scanImagePreview && (
                  <button
                    onClick={executeImageScan}
                    disabled={isScanning}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
                  >
                    <Scan className="w-4 h-4" />
                    <span>{isScanning ? 'Running Neural Net Scan...' : 'Analyze Image with DermScan AI'}</span>
                  </button>
                )}
              </div>

              {/* Right Image Preview & Report */}
              <div className="md:col-span-6 space-y-4">
                {scanImagePreview ? (
                  <div className="p-4 bg-white border border-stone-200 rounded-3xl space-y-3 relative overflow-hidden shadow-xs">
                    <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-stone-100 border border-stone-200">
                      <img src={scanImagePreview} alt="Scan Target" className="w-full h-full object-cover" />
                      {isScanning && (
                        <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm flex flex-col items-center justify-center space-y-3">
                          <Scan className="w-10 h-10 text-emerald-400 animate-spin" />
                          <div className="w-3/4 bg-stone-700 h-2 rounded-full overflow-hidden">
                            <div className="bg-emerald-400 h-full transition-all duration-300" style={{ width: `${scanProgress}%` }} />
                          </div>
                          <span className="text-xs font-mono text-emerald-300 font-bold">Scanning neural patterns... {scanProgress}%</span>
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-mono text-stone-500 block truncate font-semibold">Target: {scanPresetName}</span>
                  </div>
                ) : (
                  <div className="h-full min-h-[220px] bg-white border border-stone-200 rounded-3xl flex flex-col items-center justify-center p-6 text-center text-stone-400 shadow-2xs">
                    <Scan className="w-12 h-12 mb-2 text-stone-300" />
                    <p className="text-xs">No image selected for visual analysis yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* AI DIAGNOSTIC REPORT RESULT CARD */}
            {scanReport && (
              <div className="p-6 bg-white border border-emerald-300 rounded-3xl shadow-md space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-stone-200 pb-3 gap-2">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-base font-bold text-stone-900">DermScan Diagnostic Assessment Report</h3>
                  </div>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-mono font-bold rounded-full">
                    Confidence: {scanReport.confidence}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <span className="text-stone-500 text-[10px] block">Detected Condition</span>
                    <span className="font-bold text-emerald-800">{scanReport.condition}</span>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <span className="text-stone-500 text-[10px] block">Severity Level</span>
                    <span className="font-bold text-amber-700">{scanReport.severity}</span>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <span className="text-stone-500 text-[10px] block">Affected Anatomic Region</span>
                    <span className="font-bold text-stone-800">{scanReport.affectedArea}</span>
                  </div>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed bg-stone-50 p-3 rounded-2xl border border-stone-200">
                  {scanReport.summary}
                </p>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-emerald-800 block">Clinical Recommendations:</span>
                  <ul className="space-y-1 text-xs text-stone-600 pl-4 list-disc">
                    {scanReport.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 flex flex-wrap gap-3 border-t border-stone-200">
                  <button
                    onClick={() => {
                      handleSendMessage(`DermScan AI analyzed my face/scalp photo and diagnosed: ${scanReport.condition}. What treatment steps should I follow next?`);
                      setCurrentPage('chat');
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Ask AI Chatbot About This Diagnosis</span>
                  </button>

                  <button
                    onClick={() => setCurrentPage('doctor-chat')}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer"
                  >
                    <Stethoscope className="w-4 h-4 text-emerald-600" />
                    <span>Send Report to Lead PCP Doctor 💬</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PAGE: STRESS & CORTISOL ANALYZER QUIZ */}
        {currentPage === 'stress' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 max-w-4xl mx-auto space-y-6 w-full bg-stone-50">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div>
                <h2 className="text-xl font-bold text-stone-900 flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-emerald-600" />
                  <span>DermAura Stress & Cortisol Impact Analyzer</span>
                </h2>
                <p className="text-xs text-stone-500">
                  Assess how stress, sleep disruption, and anxiety affect your serum cortisol levels and trigger skin outbreaks.
                </p>
              </div>

              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-mono font-bold">
                NEURO-SKIN CLINICAL QUIZ
              </span>
            </div>

            {/* Assessment Cards */}
            <div className="space-y-4">
              {stressQuestions.map((q, idx) => (
                <div key={q.id} className="p-5 bg-white border border-stone-200 rounded-3xl space-y-3 shadow-2xs">
                  <h3 className="text-sm font-bold text-stone-900 flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-center font-mono font-bold">
                      0{idx + 1}
                    </span>
                    <span>{q.question}</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = stressAnswers[q.id] === opt.pts;
                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectStressOption(q.id, opt.pts)}
                          className={`p-3 rounded-2xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-2xs'
                              : 'bg-stone-50 border-stone-200 text-stone-700 hover:border-stone-300 hover:bg-white'
                          }`}
                        >
                          <span>{opt.label}</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600 ml-2 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Calculate Button */}
            <div className="pt-2 flex justify-center">
              <button
                onClick={handleCalculateStressScore}
                disabled={Object.keys(stressAnswers).length < stressQuestions.length}
                className={`py-3 px-8 rounded-2xl font-bold text-xs shadow-md flex items-center space-x-2 transition-all cursor-pointer ${
                  Object.keys(stressAnswers).length < stressQuestions.length
                    ? 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {Object.keys(stressAnswers).length < stressQuestions.length
                    ? `Answer All ${stressQuestions.length} Questions (${Object.keys(stressAnswers).length}/${stressQuestions.length})`
                    : 'Calculate My Stress & Cortisol Score'}
                </span>
              </button>
            </div>

            {/* Quiz Result Report Card */}
            {stressResult && (
              <div className="p-6 bg-white border border-stone-200 rounded-3xl space-y-5 shadow-sm animate-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                  <div className="flex items-center space-x-2">
                    <HeartPulse className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-base font-bold text-stone-900">Your Neuro-Skin Stress Diagnostic Report</h3>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold border bg-emerald-50 text-emerald-800 border-emerald-200">
                    {stressResult.category}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Score Dial */}
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col items-center justify-center text-center space-y-1">
                    <span className="text-[10px] font-mono text-stone-500 uppercase font-semibold">Stress Score</span>
                    <div className="text-3xl font-black text-emerald-700">{stressResult.percentage}%</div>
                    <span className="text-[10px] text-stone-500 font-mono">
                      {stressResult.score} / {stressResult.maxPts} Impact Points
                    </span>
                  </div>

                  {/* Summary */}
                  <div className="md:col-span-2 p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                    <span className="text-[10px] font-mono text-emerald-800 uppercase font-bold">Clinical Impact Summary</span>
                    <p className="text-xs text-stone-600 leading-relaxed">{stressResult.summary}</p>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                  <span className="text-[10px] font-mono text-emerald-800 uppercase font-bold flex items-center">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    Recommended Dermatologist Care Steps:
                  </span>
                  <ul className="space-y-1.5 text-xs text-stone-600">
                    {stressResult.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Share With Doctor Action Bar */}
                <div className="pt-2 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="text-xs text-stone-500">
                    💡 Sharing lets your consulting doctor review your stress levels alongside your DermScan diagnoses.
                  </span>

                  <button
                    onClick={handleShareStressReportWithDoctor}
                    disabled={stressSharedWithDoctor}
                    className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs shadow-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                      stressSharedWithDoctor
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-default'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {stressSharedWithDoctor ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Shared with Doctor ✓</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Share Quiz Results with Doctor</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* BOOKING MODAL */}
        {selectedDoctorForBooking && (
          <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-stone-200 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 relative">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <h3 className="text-base font-bold text-stone-900">Confirm Appointment with {selectedDoctorForBooking.name}</h3>
                <button onClick={() => setSelectedDoctorForBooking(null)} className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                  <span className="text-stone-500 font-mono text-[10px] block uppercase">Doctor Specialty</span>
                  <p className="font-bold text-emerald-800">{selectedDoctorForBooking.role}</p>
                </div>

                <div>
                  <label className="block text-stone-700 mb-1 font-semibold">Select Appointment Date *</label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 mb-1 font-semibold">Preferred Time Slot *</label>
                  <select
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-600"
                  >
                    <option value="10:30 AM">10:30 AM (Morning)</option>
                    <option value="02:15 PM">02:15 PM (Afternoon)</option>
                    <option value="06:00 PM">06:00 PM (Evening)</option>
                  </select>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-[11px] text-emerald-800">
                  ⚡ Confirming this consultation will automatically issue a verified doctor prescription to unlock DermPharmacy Rx medicines!
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  onClick={() => setSelectedDoctorForBooking(null)}
                  className="w-1/3 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmBooking}
                  className="w-2/3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  Confirm & Issue Prescription
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PAGE 6: EMERGENCY SOS */}
        {currentPage === 'emergency' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 max-w-4xl mx-auto space-y-6 w-full bg-stone-50">
            <div className="border-b border-rose-200 pb-4">
              <h2 className="text-xl font-bold text-rose-700 flex items-center space-x-2">
                <PhoneCall className="w-5 h-5 text-rose-600" />
                <span>Emergency Medical SOS</span>
              </h2>
              <p className="text-xs text-stone-600">Instant 24/7 hotline numbers for acute allergic flares or facial burns.</p>
            </div>

            <div className="p-8 bg-white border border-rose-200 rounded-3xl text-center space-y-4 shadow-sm">
              <PhoneCall className="w-12 h-12 text-rose-600 mx-auto animate-bounce" />
              <h3 className="text-2xl font-black text-stone-900">Call National Medical Helpline</h3>
              <p className="text-xs text-stone-600 max-w-md mx-auto">
                For urgent medical transport or severe reactions, call 108 immediately.
              </p>
              <a
                href="tel:108"
                className="inline-block px-8 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl shadow-md shadow-rose-600/20 cursor-pointer"
              >
                Dial 108 Emergency Now
              </a>
            </div>
          </div>
        )}

      </main>

      {/* 3. PROFILE DETAILS MODAL */}
      {showProfileDetailsModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 relative">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center space-x-2">
                {user.role === 'doctor' ? <Stethoscope className="w-5 h-5 text-emerald-600" /> : <User className="w-5 h-5 text-emerald-600" />}
                <h3 className="text-base font-bold text-stone-900">
                  {user.role === 'doctor' ? 'Doctor Profile Details' : 'Patient Profile Details'}
                </h3>
              </div>
              <button
                onClick={() => setShowProfileDetailsModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                <span className="text-[10px] text-stone-500 font-mono uppercase">Full Name</span>
                <p className="font-bold text-stone-900 text-sm">{user.fullName}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[10px] text-stone-500 font-mono uppercase">Role</span>
                  <p className="font-bold text-emerald-700 uppercase">{user.role}</p>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[10px] text-stone-500 font-mono uppercase">Status</span>
                  <p className="font-bold text-emerald-700">Verified</p>
                </div>
              </div>
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                <span className="text-[10px] text-stone-500 font-mono uppercase">Email Address</span>
                <p className="font-semibold text-stone-800">{user.email}</p>
              </div>

              {user.role === 'doctor' && (
                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                  <span className="text-[10px] text-stone-500 font-mono uppercase">Medical License & Specialization</span>
                  <p className="font-semibold text-emerald-800">{user.licenseNumber || 'MCI-98421-B'} ({user.specialization || 'Dermatology'})</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowProfileDetailsModal(false)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              Close Profile
            </button>
          </div>
        </div>
      )}

      {/* 4. SHOPPING CART DRAWER MODAL */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-white border-l border-stone-200 p-6 flex flex-col justify-between h-full shadow-2xl animate-in slide-in-from-right">
            <div>
              <div className="flex items-center justify-between border-b border-stone-200 pb-4 mb-4">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-lg font-bold text-stone-900">Your Medical Cart ({cart.length})</h3>
                </div>
                <button
                  onClick={() => setCartOpen(false)}
                  className="p-1 text-stone-500 hover:text-stone-800 text-xs font-bold cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-12 space-y-2 text-stone-400">
                  <ShoppingBag className="w-12 h-12 mx-auto text-stone-300" />
                  <p className="text-xs">Your cart is empty.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
                  {cart.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-stone-50 rounded-2xl border border-stone-200 text-xs">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{item.image}</span>
                        <div>
                          <p className="font-bold text-stone-900 truncate max-w-[180px]">{item.name}</p>
                          <span className="text-[10px] text-stone-500">₹{item.price}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(index)}
                        className="p-1 text-rose-600 hover:text-rose-800 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-stone-200 pt-4 space-y-3">
              <div className="flex justify-between text-sm font-bold text-stone-900">
                <span>Total Amount:</span>
                <span className="text-emerald-700 font-mono">₹{cartTotal}</span>
              </div>
              <button
                disabled={cart.length === 0}
                onClick={() => {
                  alert(`Order Placed Successfully for ₹${cartTotal}! Delivery estimated within 24 hours.`);
                  setCart([]);
                  setCartOpen(false);
                }}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REQUEST DOCTOR RX UNLOCK FOR PRODUCT */}
      {unlockRequestModalProduct && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 relative">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center space-x-2">
                <Lock className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-stone-900">Ask Doctor to Unlock Product</h3>
              </div>
              <button
                onClick={() => setUnlockRequestModalProduct(null)}
                className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Product Card Details */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex items-center space-x-4">
              <div className="w-14 h-14 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-3xl flex-shrink-0 shadow-2xs">
                {unlockRequestModalProduct.image}
              </div>
              <div className="truncate">
                <span className="text-[10px] font-mono text-emerald-700 uppercase font-bold block">
                  {unlockRequestModalProduct.category}
                </span>
                <h4 className="text-sm font-bold text-stone-900 truncate">{unlockRequestModalProduct.name}</h4>
                <p className="text-xs text-emerald-700 font-mono font-bold">₹{unlockRequestModalProduct.price}</p>
              </div>
            </div>

            {/* Fixed: Always routes to Lead Primary Doctor */}
            <div className="p-3 bg-stone-50 rounded-2xl border border-emerald-300 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-xl flex-shrink-0 shadow-2xs">
                👩‍⚕️
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <Crown className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-xs font-bold text-stone-900">
                    {user?.primaryLeadDoctorName || 'Dr. Sarah Jenkins'}
                  </span>
                </div>
                <p className="text-[10px] text-stone-500 mt-0.5">Lead Primary Care Provider (PCP Gatekeeper)</p>
                <span className="text-[9px] font-mono text-emerald-700 font-semibold">🟢 Online & Ready</span>
              </div>
            </div>

            {/* Note text area */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 block">Your Message to Lead Doctor:</label>
              <textarea
                rows={3}
                value={unlockRequestNote}
                onChange={(e) => setUnlockRequestNote(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-xs text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:border-emerald-600 custom-scrollbar"
              />
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span>All prescription unlock requests go exclusively to your Lead Primary Doctor for centralized safety review and drug interaction checks.</span>
            </div>

            <div className="pt-2 flex items-center justify-end space-x-2">
              <button
                onClick={() => setUnlockRequestModalProduct(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const newRequest = {
                    id: 'req_' + Date.now(),
                    patientName: user.fullName || 'Aarav Sharma',
                    productId: unlockRequestModalProduct.id,
                    productName: unlockRequestModalProduct.name,
                    productPrice: unlockRequestModalProduct.price,
                    productImage: unlockRequestModalProduct.image,
                    doctorName: selectedDoctorForUnlock || 'Dr. Ananya Patel, MD (Lead Primary Care Provider)',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    message: unlockRequestNote,
                    status: 'Pending Lead PCP Approval ⏳'
                  };

                  try {
                    const existing = JSON.parse(localStorage.getItem('dermaura_doctor_chat_requests') || '[]');
                    localStorage.setItem('dermaura_doctor_chat_requests', JSON.stringify([newRequest, ...existing]));
                  } catch (e) {
                    localStorage.setItem('dermaura_doctor_chat_requests', JSON.stringify([newRequest]));
                  }

                  const chatMsg = {
                    id: `msg-${Date.now()}`,
                    sender: 'patient',
                    senderName: user.fullName || 'Aarav Sharma',
                    text: unlockRequestNote || `Doctor, I request prescription unlock for ${unlockRequestModalProduct.name} to purchase in DermPharmacy.`,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    type: 'unlock_request',
                    productData: {
                      id: unlockRequestModalProduct.id,
                      name: unlockRequestModalProduct.name,
                      category: unlockRequestModalProduct.category || 'Prescription Medicine',
                      price: unlockRequestModalProduct.price,
                      image: unlockRequestModalProduct.image || '💊',
                      isUnlocked: false
                    }
                  };

                  try {
                    const savedMsgs = JSON.parse(localStorage.getItem('dermaura_health_chatroom_messages') || '[]');
                    localStorage.setItem('dermaura_health_chatroom_messages', JSON.stringify([...savedMsgs, chatMsg]));
                  } catch (e) {}

                  setBookingToast(`Unlock request for ${unlockRequestModalProduct.name} posted to your Lead PCP ${user?.primaryLeadDoctorName || 'Dr. Sarah Jenkins'} in your Doctor Chatroom!`);
                  setTimeout(() => setBookingToast(null), 5000);
                  setUnlockRequestModalProduct(null);
                  setCurrentPage('doctor-chat');
                }}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post Request to Lead Doctor Chatroom 💬</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DOCTOR SWITCH ESCROW TRANSFER */}
      <DoctorSwitchModal
        isOpen={doctorSwitchModalOpen}
        consultationId="consult-md-101"
        currentDoctorName={user?.primaryLeadDoctorName || 'Dr. Sarah Jenkins'}
        currentDoctorId={user?.primaryLeadDoctorId || 'doc-sarah-jenkins'}
        totalDays={10}
        daysServed={4}
        totalAmount={3000}
        dailyRate={300}
        onClose={() => setDoctorSwitchModalOpen(false)}
        onSwitchSuccess={handleDoctorSwitchSuccess}
      />

    </div>
  );
}
