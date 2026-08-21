import React, { useState, useEffect, useRef, useMemo } from 'react';
import dermAuraLogo from '../dermAuraLogoNoBG.png';
import {
  MessageSquare,
  Send,
  User,
  Stethoscope,
  Video,
  Phone,
  Lock,
  Unlock,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Bot,
  Scan,
  HeartPulse,
  ShoppingBag,
  FileText,
  Paperclip,
  CheckCircle2,
  Clock,
  Plus,
  X,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  ExternalLink,
  ChevronRight,
  Crown,
  AlertTriangle,
  Archive,
  Check,
  Ban,
  ShieldX,
  UserX
} from 'lucide-react';

export default function HealthChatroom({ role = 'patient', currentUser = {}, initialPatientId = null, doctorPatients = null, onNavigate }) {
  // ── Resolve lead doctor from patient's selection (stored in user object / localStorage) ──
  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem('dermaura_user') || '{}'); } catch { return {}; }
  })();
  const resolvedUser = { ...storedUser, ...currentUser };
  const leadDoctorName = resolvedUser.primaryLeadDoctorName || 'Dr. Sarah Jenkins';
  const patientName    = resolvedUser.fullName || 'Aarav Sharma';

  // ── D2D Error banner state ────────────────────────────────────────────────
  const [d2dError, setD2dError] = useState(null); // string | null

  // Helper to normalize patient IDs to pat-1, pat-2, pat-3, etc.
  const normalizePatientId = (id) => {
    if (!id) return 'pat-1';
    if (id === 'p-101' || id === 'pat-1') return 'pat-1';
    if (id === 'p-102' || id === 'pat-2') return 'pat-2';
    if (id === 'p-103' || id === 'pat-3') return 'pat-3';
    if (id === 'p-104' || id === 'pat-4') return 'pat-4';
    return id;
  };

  const getStorageKeyForChat = (patId, channelId) => {
    const normPat = normalizePatientId(patId);
    const normChan = channelId || 'SKIN_CARE_demo-doc-101';
    return `dermaura_chat_${normPat}_${normChan}`;
  };

  // Dynamic Category-Specific Lead Doctors list with unique channel identifiers
  const doctorsList = useMemo(() => {
    const rawLeadDocs = (resolvedUser.leadDoctors && resolvedUser.leadDoctors.length > 0)
      ? resolvedUser.leadDoctors
      : [
          { category: 'SKIN_CARE', doctorId: 'demo-doc-101', doctorName: 'Dr. Sarah Jenkins, MD', specialization: 'Facial Dermatology & Barrier Specialist', status: 'ACTIVE' },
          { category: 'HAIR_CARE', doctorId: 'doc-pcp-3', doctorName: 'Dr. Priya Menon, MD', specialization: 'Trichologist & Scalp Specialist', status: 'ACTIVE' },
          { category: 'GENERAL_HEALTH', doctorId: 'doc-pcp-2', doctorName: 'Dr. Rajesh Kumar, MBBS', specialization: 'Internal Medicine & Drug Safety Gatekeeper', status: 'ACTIVE' },
        ];

    const categoryMeta = {
      SKIN_CARE: { label: '✨ Skin Care Lead', icon: '👩‍⚕️', hospital: 'AIIMS Hospital & DermAura Board', prefix: 'Facial Dermatology' },
      HAIR_CARE: { label: '💇 Hair Care Lead', icon: '👩‍⚕️', hospital: 'AIIMS New Delhi Trichology Wing', prefix: 'Hair & Scalp Health' },
      GENERAL_HEALTH: { label: '🩺 General Care Lead', icon: '👨‍⚕️', hospital: 'Apollo Hospitals, Delhi', prefix: 'General Health & Vitals' },
    };

    return rawLeadDocs.map((ld) => {
      const meta = categoryMeta[ld.category] || { label: '🩺 Primary Lead', icon: '👩‍⚕️', hospital: 'AIIMS Hospital', prefix: 'General Practice' };
      const channelId = `${ld.category}_${ld.doctorId || 'demo-doc-101'}`;
      return {
        id: ld.doctorId || 'demo-doc-101',
        channelId: channelId,
        name: ld.doctorName || 'Dr. Sarah Jenkins',
        category: ld.category,
        categoryLabel: meta.label,
        categoryPrefix: meta.prefix,
        specialty: `${meta.label} • ${ld.specialization || 'Clinical Specialist'}`,
        hospital: ld.hospitalName || meta.hospital,
        photo: meta.icon,
        isLeadDoctor: true,
        doctorRole: 'LEAD_PRIMARY',
        status: 'ACTIVE_LEAD',
        availability: '🟢 Active Category Gatekeeper',
      };
    });
  }, [resolvedUser.leadDoctors]);

  // Patients list for Doctor's view
  const defaultPatientsList = [
    {
      id: 'pat-1',
      originalId: 'p-101',
      name: patientName,
      age: resolvedUser.age || 26,
      gender: resolvedUser.gender || 'Male',
      photo: '👨',
      primaryLeadDoctorId: resolvedUser.primaryLeadDoctorId || 'demo-doc-101',
      leadDoctorName: leadDoctorName,
      concern: 'Severe Facial Acne & Inflammatory Papules',
      activeMedications: ['Gentle Facial Moisturizer 499mg', 'SPF 50+ Sunscreen'],
      status: 'Active Now'
    },
    {
      id: 'pat-2',
      originalId: 'p-102',
      name: 'Priya Patel',
      age: 31,
      gender: 'Female',
      photo: '👩',
      primaryLeadDoctorId: resolvedUser.primaryLeadDoctorId || 'demo-doc-101',
      leadDoctorName: leadDoctorName,
      concern: 'Scalp Seborrheic Dermatitis & Hair Flaking',
      activeMedications: ['Aloe Gel 299mg'],
      status: 'Ready for Review'
    },
    {
      id: 'pat-3',
      originalId: 'p-103',
      name: 'Rohan Verma',
      age: 42,
      gender: 'Male',
      photo: '👨‍💼',
      primaryLeadDoctorId: resolvedUser.primaryLeadDoctorId || 'demo-doc-101',
      leadDoctorName: leadDoctorName,
      concern: 'Facial Erythema & Capillary Flushing',
      activeMedications: ['Soothe Cream 100mg'],
      status: 'Scheduled'
    },
    {
      id: 'pat-4',
      originalId: 'p-104',
      name: 'Sneha Reddy',
      age: 24,
      gender: 'Female',
      photo: '👩‍🦰',
      primaryLeadDoctorId: resolvedUser.primaryLeadDoctorId || 'demo-doc-101',
      leadDoctorName: leadDoctorName,
      concern: 'Scalp Folliculitis & Severe Itching',
      activeMedications: ['Scalp Purifying Wash'],
      status: 'Waiting in Queue'
    }
  ];

  const patientsList = doctorPatients && doctorPatients.length > 0
    ? doctorPatients
        // ── FRONTEND ROLE GUARD ─────────────────────────────────────────────
        // Filter #1: Strictly allow only entries whose role is explicitly 'PATIENT'.
        // This client-side guard ensures that even if the API response is
        // malformed or a future regression introduces a doctor account into the
        // payload, it will NEVER be rendered in the patient queue sidebar.
        .filter((dp) => {
          const entryRole = (dp.role || '').toUpperCase();
          // Allow entries that explicitly declare PATIENT or have no role field
          // (legacy data compatibility) — but NEVER allow DOCTOR role accounts.
          if (entryRole === 'DOCTOR') {
            console.warn(
              `[HealthChatroom] SECURITY: Blocked doctor account "${dp.name || dp.fullName}" ` +
              `(id: ${dp.id || dp._id}) from appearing in patient queue. ` +
              `This indicates an API-level filtering bug that must be fixed in doctorRoutes.js.`
            );
            return false;
          }
          return true;
        })
        .map((dp) => ({
          id: normalizePatientId(dp.id || dp._id),
          originalId: dp.id || dp._id,
          name: dp.name || dp.fullName,
          role: 'PATIENT', // Normalize to canonical role for downstream checks
          age: dp.age || 28,
          gender: dp.gender || 'Patient',
          photo: dp.photo || '👨‍💼',
          primaryLeadDoctorId: resolvedUser.primaryLeadDoctorId || 'demo-doc-101',
          leadDoctorName: leadDoctorName,
          concern: dp.concern || 'Dermatology Consultation',
          activeMedications: dp.allergies && dp.allergies.length > 0 ? [`Allergies: ${dp.allergies.join(', ')}`] : ['Gentle Skincare'],
          status: dp.status || 'Active Now'
        }))
    : defaultPatientsList;

  // ── FRONTEND ROLE GUARD (applied to default list too) ────────────────────
  // Filter #2: Ensures the default/seed patient list also passes the role check.
  // Prevents any accidental seeding of doctor objects into the demo list.
  const safePatientsList = patientsList.filter((p) => {
    const entryRole = (p.role || 'PATIENT').toUpperCase();
    return entryRole !== 'DOCTOR';
  });

  // ── Helper to generate unique seed messages per Clinical Category & Doctor ──
  const getCategorySeedMessagesForPatient = (patId, patName, doctorObj) => {
    const norm = normalizePatientId(patId);
    const category = doctorObj?.category || 'SKIN_CARE';
    const doctorName = doctorObj?.name || 'Dr. Sarah Jenkins, MD';

    // Different seed messages for other patients in doctor portal
    if (norm === 'pat-2') {
      return [
        {
          id: 'msg-p2-1',
          sender: 'doctor',
          senderName: `${doctorName} (Hair Care Lead Doctor)`,
          isLead: true,
          text: `Hello ${patName}! I have reviewed your latest scalp scan showing Seborrheic Dermatitis flaking. I am prescribing Ketoconazole 2% Anti-Dandruff Cleanser.`,
          timestamp: '11:15 AM',
          type: 'text'
        },
        {
          id: 'msg-p2-2',
          sender: 'patient',
          senderName: patName,
          text: `Thank you Dr. ${doctorName.split(' ')[1] || 'Doctor'}! Should I leave the shampoo on for 5 minutes before rinsing?`,
          timestamp: '11:18 AM',
          type: 'text'
        }
      ];
    } else if (norm === 'pat-3') {
      return [
        {
          id: 'msg-p3-1',
          sender: 'doctor',
          senderName: `${doctorName} (Skin Care Lead Doctor)`,
          isLead: true,
          text: `Hello ${patName}! I am reviewing your pre-consultation notes on facial inflammatory erythema and cheek flushing.`,
          timestamp: '12:00 PM',
          type: 'text'
        },
        {
          id: 'msg-p3-2',
          sender: 'patient',
          senderName: patName,
          text: `Hello Doctor! The cheek redness flares up after hot weather exposure or spicy food.`,
          timestamp: '12:03 PM',
          type: 'text'
        }
      ];
    }

    // ── Dedicated Separate Channels for Aarav Sharma (pat-1) ──
    if (category === 'SKIN_CARE') {
      return [
        {
          id: 'msg-skin-1',
          sender: 'doctor',
          senderName: `${doctorName} (✨ Skin Care Lead Doctor)`,
          isLead: true,
          text: `Hello ${patName}! I am your assigned Skin Care Lead Doctor. I oversee your facial dermatology treatments, acne protocols, barrier repair, and topical prescriptions. How is your facial skin feeling today?`,
          timestamp: '10:00 AM',
          type: 'text'
        },
        {
          id: 'msg-skin-2',
          sender: 'patient',
          senderName: patName,
          text: `Hi Dr. ${doctorName.split(' ')[1] || 'Doctor'}! The malar cheek redness has subsided, but I have a few inflammatory breakouts on the forehead. The gentle moisturizer has helped with dryness.`,
          timestamp: '10:04 AM',
          type: 'text'
        },
        {
          id: 'msg-skin-3',
          sender: 'doctor',
          senderName: `${doctorName} (✨ Skin Care Lead Doctor)`,
          isLead: true,
          text: `Great progress. Continue applying the SPF 50+ Sunscreen every morning and use the barrier repair cream at night. Let me know if you experience any purging.`,
          timestamp: '10:07 AM',
          type: 'text'
        }
      ];
    } else if (category === 'HAIR_CARE') {
      return [
        {
          id: 'msg-hair-1',
          sender: 'doctor',
          senderName: `${doctorName} (💇 Hair Care Lead Doctor)`,
          isLead: true,
          text: `Hello ${patName}! I am your Hair & Scalp Lead Specialist. I oversee your trichology consultations, scalp dermatitis protocols, and follicle regrowth therapy.`,
          timestamp: '10:15 AM',
          type: 'text'
        },
        {
          id: 'msg-hair-2',
          sender: 'patient',
          senderName: patName,
          text: `Hello Dr. ${doctorName.split(' ')[1] || 'Doctor'}! I am noticing some mild hair thinning around the vertex crown area. Is it safe to start topical Minoxidil?`,
          timestamp: '10:18 AM',
          type: 'text'
        },
        {
          id: 'msg-hair-3',
          sender: 'doctor',
          senderName: `${doctorName} (💇 Hair Care Lead Doctor)`,
          isLead: true,
          text: `PROPOSED SCALP REGIMEN: Minoxidil 5% Scalp Solution (1ml once daily at night). Approved for your vertex profile.`,
          timestamp: '10:22 AM',
          type: 'proposed_rx',
          rxProposalData: {
            id: 'rx-prop-hair-881',
            medicineName: 'Minoxidil 5% Scalp Solution',
            dosage: '1ml once daily to vertex scalp',
            duration: '60 Days',
            specialistName: doctorName,
            specialistRole: 'Hair Care Lead Doctor',
            status: 'APPROVED',
            productId: 'p7',
            rationale: 'Targeted scalp follicle revitalization for vertex thinning.'
          }
        }
      ];
    } else {
      // GENERAL_HEALTH
      return [
        {
          id: 'msg-gen-1',
          sender: 'doctor',
          senderName: `${doctorName} (🩺 General Health Gatekeeper)`,
          isLead: true,
          text: `Hello ${patName}! I am your General Health & Drug Safety Gatekeeper. I review systemic vitals, drug interactions between skin/hair treatments, and overall wellness.`,
          timestamp: '10:30 AM',
          type: 'text'
        },
        {
          id: 'msg-gen-2',
          sender: 'patient',
          senderName: patName,
          text: `Hello Dr. ${doctorName.split(' ')[1] || 'Doctor'}! My recent stress evaluation showed moderate fatigue. Are there any interactions with my topical acne gel?`,
          timestamp: '10:33 AM',
          type: 'text'
        },
        {
          id: 'msg-gen-3',
          sender: 'doctor',
          senderName: `${doctorName} (🩺 General Health Gatekeeper)`,
          isLead: true,
          text: `I have cross-checked your active skin and hair prescriptions against your systemic medical profile. Zero adverse drug-drug interactions detected. Keep up good hydration and restful sleep!`,
          timestamp: '10:37 AM',
          type: 'text'
        }
      ];
    }
  };

  const [selectedDoctor, setSelectedDoctor] = useState(() => doctorsList[0] || {});

  useEffect(() => {
    if (!selectedDoctor?.channelId || !doctorsList.find((d) => d.channelId === selectedDoctor.channelId)) {
      setSelectedDoctor(doctorsList[0] || {});
    }
  }, [doctorsList]);

  // Determine starting patient
  const targetInitId = initialPatientId ? normalizePatientId(initialPatientId) : 'pat-1';
  const initialPatientObj = safePatientsList.find(p => p.id === targetInitId || p.originalId === targetInitId) || safePatientsList[0];

  const [selectedPatient, setSelectedPatient] = useState(initialPatientObj);
  const [chatroomStatus, setChatroomStatus] = useState('ACTIVE_LEAD');

  // Real-time Synced Doctor Clinical Duty Status
  const [doctorDutyStatus, setDoctorDutyStatus] = useState(() => {
    try {
      return localStorage.getItem('dermaura_doctor_duty_status') || 'online';
    } catch (e) {
      return 'online';
    }
  });

  useEffect(() => {
    const syncStatus = () => {
      try {
        setDoctorDutyStatus(localStorage.getItem('dermaura_doctor_duty_status') || 'online');
      } catch (e) {}
    };
    window.addEventListener('storage', syncStatus);
    window.addEventListener('dermaura_duty_status_changed', syncStatus);
    const interval = setInterval(syncStatus, 1000);
    return () => {
      window.removeEventListener('storage', syncStatus);
      window.removeEventListener('dermaura_duty_status_changed', syncStatus);
      clearInterval(interval);
    };
  }, []);

  // Load messages specifically for a patient & doctor channel
  const loadMessagesForChannel = (pat, doc) => {
    if (!pat) return [];
    const chanId = doc?.channelId || `${doc?.category || 'SKIN_CARE'}_${doc?.id || 'demo-doc-101'}`;
    const key = getStorageKeyForChat(pat.id, chanId);

    try {
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
    } catch (e) {}

    return getCategorySeedMessagesForPatient(pat.id, pat.name, doc);
  };

  const [messages, setMessages] = useState(() => loadMessagesForChannel(initialPatientObj, doctorsList[0]));

  const [inputMessage, setInputMessage] = useState('');
  const [activeCallModal, setActiveCallModal] = useState(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [rejectionModalRx, setRejectionModalRx] = useState(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  const lastSavedStrRef = useRef('');
  const chatContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const isInitialMountRef = useRef(true);
  const userJustSentRef = useRef(false);

  // Respond to initialPatientId prop changes
  useEffect(() => {
    if (initialPatientId) {
      const normInit = normalizePatientId(initialPatientId);
      const match = safePatientsList.find(p => p.id === normInit || p.originalId === initialPatientId);
      if (match && match.id !== selectedPatient.id) {
        setSelectedPatient(match);
      }
    }
  }, [initialPatientId]);

  // Load isolated chat messages when selectedPatient or selectedDoctor channel changes
  useEffect(() => {
    if (!selectedPatient || !selectedDoctor) return;
    const loaded = loadMessagesForChannel(selectedPatient, selectedDoctor);
    setMessages(loaded);
    lastSavedStrRef.current = JSON.stringify(loaded);
  }, [selectedPatient?.id, selectedDoctor?.channelId]);

  // Save messages isolated by patient ID and doctor channel
  const saveMessagesToStorage = (newMsgs) => {
    const str = JSON.stringify(newMsgs);
    lastSavedStrRef.current = str;
    setMessages(newMsgs);

    const pat = selectedPatient || safePatientsList[0];
    const chanId = selectedDoctor?.channelId || `${selectedDoctor?.category || 'SKIN_CARE'}_${selectedDoctor?.id || 'demo-doc-101'}`;
    const key = getStorageKeyForChat(pat.id, chanId);
    try {
      localStorage.setItem(key, str);
    } catch (e) {}
  };

  // Sync state across tabs/portals for the currently selected patient & doctor channel
  useEffect(() => {
    const syncChat = () => {
      const pat = selectedPatient || safePatientsList[0];
      if (!pat || !selectedDoctor) return;
      const chanId = selectedDoctor?.channelId || `${selectedDoctor?.category || 'SKIN_CARE'}_${selectedDoctor?.id || 'demo-doc-101'}`;
      const key = getStorageKeyForChat(pat.id, chanId);
      try {
        const saved = localStorage.getItem(key);
        if (saved && saved !== lastSavedStrRef.current) {
          lastSavedStrRef.current = saved;
          setMessages(JSON.parse(saved));
        }
      } catch (e) {}
    };

    syncChat();
    window.addEventListener('storage', syncChat);
    const interval = setInterval(syncChat, 1000);
    return () => {
      window.removeEventListener('storage', syncChat);
      clearInterval(interval);
    };
  }, [selectedPatient?.id, selectedDoctor?.channelId]);

  // Smart auto-scroll: only scroll to bottom if user just sent a message, initial load, or user is near bottom
  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      return;
    }

    if (userJustSentRef.current) {
      userJustSentRef.current = false;
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
      if (isNearBottom) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages]);

  // Update Chatroom status and switch isolated conversation on doctor channel select
  const handleSelectDoctor = (doc) => {
    setSelectedDoctor(doc);
    setChatroomStatus(doc.status || 'ACTIVE_LEAD');
    userJustSentRef.current = true;
    const loaded = loadMessagesForChannel(selectedPatient, doc);
    setMessages(loaded);
    lastSavedStrRef.current = JSON.stringify(loaded);
  };

  const handleSelectPatient = (pat) => {
    setSelectedPatient(pat);
    userJustSentRef.current = true;
    const loaded = loadMessagesForChannel(pat, selectedDoctor);
    setMessages(loaded);
    lastSavedStrRef.current = JSON.stringify(loaded);
  };

  // Send Text Message
  const handleSendMessage = () => {
    if (!inputMessage.trim() || chatroomStatus === 'CLOSED_READ_ONLY') return;

    // ── DOCTOR-TO-DOCTOR MESSAGE GUARD ───────────────────────────────────────
    // If the currently active chatroom context does not have a valid patient
    // (i.e., selectedPatient is missing or has a non-patient role), abort and
    // surface a user-facing 403-equivalent error banner.
    if (role === 'doctor') {
      const recipientRole = (selectedPatient?.role || 'PATIENT').toUpperCase();
      if (recipientRole === 'DOCTOR') {
        setD2dError(
          'Doctor-to-Doctor direct chat is disabled in patient rooms. ' +
          'Switch to a valid patient conversation to send messages.'
        );
        // Auto-dismiss after 5 seconds
        setTimeout(() => setD2dError(null), 5000);
        return;
      }
    }

    // ── VALID PATIENT CONTEXT GUARD ──────────────────────────────────────────
    // If no valid patient is selected (e.g., selectedPatient is null/undefined),
    // block the send action and prompt the doctor to select a valid patient.
    if (role === 'doctor' && !selectedPatient?.id) {
      setD2dError('No valid patient selected. Please select a patient from the queue to start messaging.');
      setTimeout(() => setD2dError(null), 5000);
      return;
    }

    // Clear any previous error on successful send
    setD2dError(null);

    const isDocLead = selectedDoctor?.isLeadDoctor;
    const docCatLabel = selectedDoctor?.categoryLabel || 'Lead Doctor';
    const senderTitle = role === 'doctor'
      ? (isDocLead ? `${currentUser.fullName || 'Dr. Sarah Jenkins'} (${docCatLabel})` : `${currentUser.fullName || 'Dr. Vikramaditya'} (Specialist)`)
      : (currentUser.fullName || 'Aarav Sharma');

    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: role,
      senderName: senderTitle,
      isLead: isDocLead,
      text: inputMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text'
    };

    userJustSentRef.current = true;
    saveMessagesToStorage([...messages, newMsg]);
    setInputMessage('');
  };

  // Specialist Proposes Prescription (Status: PROPOSED)
  const handleSpecialistProposeRx = (medName, dosage, duration, productId, rationale) => {
    const propMsg = {
      id: `msg-${Date.now()}`,
      sender: 'doctor',
      senderName: 'Dr. Vikramaditya Sen, MD (Referred Specialist)',
      isLead: false,
      text: `PROPOSED PRESCRIPTION: Specialist has recommended ${medName}. Sent to Lead Doctor for gatekeeper verification & approval.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'proposed_rx',
      rxProposalData: {
        id: `rx-prop-${Date.now().toString().slice(-4)}`,
        medicineName: medName,
        dosage: dosage,
        duration: duration,
        specialistName: 'Dr. Vikramaditya Sen, MD',
        specialistRole: 'Referred Specialist',
        status: 'PROPOSED',
        productId: productId,
        rationale: rationale || 'Clinical specialist consultation recommendation.'
      }
    };
    saveMessagesToStorage([...messages, propMsg]);
  };

  // Lead Doctor Approves Proposed Prescription (Transition: PROPOSED -> APPROVED)
  const handleLeadApproveRx = (msgId, productId, medicineName) => {
    // 1. Update message status to APPROVED
    const updatedMsgs = messages.map((m) => {
      if (m.id === msgId && m.rxProposalData) {
        return {
          ...m,
          rxProposalData: {
            ...m.rxProposalData,
            status: 'APPROVED',
            approvedBy: 'Dr. Ananya Patel, MD (Lead Primary Care Provider)',
            approvedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        };
      }
      return m;
    });

    // 2. Unlock product in DermPharmacy
    try {
      const saved = localStorage.getItem('dermaura_unlocked_products');
      const list = saved ? JSON.parse(saved) : ['p3', 'p4'];
      if (!list.includes(productId)) {
        list.push(productId);
        localStorage.setItem('dermaura_unlocked_products', JSON.stringify(list));
      }
    } catch (e) {}

    // 3. Post confirmation in chat stream
    const confirmMsg = {
      id: `msg-${Date.now()}`,
      sender: 'doctor',
      senderName: 'Dr. Ananya Patel, MD (Lead Primary Care Provider)',
      isLead: true,
      text: `🟢 LEAD DOCTOR AUTHORIZATION: I have verified ${medicineName} against current active medications. No drug interactions detected. Prescription APPROVED & UNLOCKED in DermPharmacy!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text'
    };

    saveMessagesToStorage([...updatedMsgs, confirmMsg]);
  };

  // Lead Doctor Rejects Proposed Prescription (Transition: PROPOSED -> REJECTED)
  const handleLeadRejectRx = () => {
    if (!rejectionModalRx) return;

    const { msgId, medicineName } = rejectionModalRx;
    const reason = rejectionReasonInput.trim() || 'Potential contraindication with patient active medications.';

    const updatedMsgs = messages.map((m) => {
      if (m.id === msgId && m.rxProposalData) {
        return {
          ...m,
          rxProposalData: {
            ...m.rxProposalData,
            status: 'REJECTED',
            rejectionReason: reason,
            rejectedBy: 'Dr. Ananya Patel, MD (Lead Primary Care Provider)',
            rejectedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        };
      }
      return m;
    });

    const alertMsg = {
      id: `msg-${Date.now()}`,
      sender: 'doctor',
      senderName: 'Dr. Ananya Patel, MD (Lead Primary Care Provider)',
      isLead: true,
      text: `🔴 LEAD DOCTOR SAFETY REJECTION: Proposed prescription "${medicineName}" was REJECTED. Reason: ${reason}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text'
    };

    saveMessagesToStorage([...updatedMsgs, alertMsg]);
    setRejectionModalRx(null);
    setRejectionReasonInput('');
  };

  // Close Consultation Chatroom (Transition -> CLOSED_READ_ONLY)
  const handleCloseChatroom = () => {
    setChatroomStatus('CLOSED_READ_ONLY');
    setSelectedDoctor((prev) => ({ ...prev, status: 'CLOSED_READ_ONLY' }));

    const closeMsg = {
      id: `msg-${Date.now()}`,
      sender: 'doctor',
      senderName: role === 'doctor' ? (currentUser.fullName || 'Dr. Ananya Patel, MD') : 'Dr. Ananya Patel, MD',
      isLead: true,
      text: `🔒 EPISODIC CONSULTATION COMPLETED: This specialist chatroom session has been officially closed and archived in READ-ONLY mode to prevent outdated medical advice.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text'
    };

    saveMessagesToStorage([...messages, closeMsg]);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full w-full bg-stone-50 text-stone-900 overflow-hidden font-sans">
      
      {/* LEFT SIDEBAR: CONTACT SELECTION WITH LEAD VS SPECIALIST TAGS */}
      <div className="w-full md:w-72 bg-stone-50/90 border-r border-stone-200 flex flex-col justify-between flex-shrink-0">
        <div className="p-4 border-b border-stone-200 space-y-2 bg-white/50">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-emerald-100/70 text-emerald-800 border border-emerald-200">
              <Crown className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900">Lead Doctor Architecture</h2>
              <span className="text-[10px] text-emerald-700 font-mono font-bold">PCP Gatekeeper Model</span>
            </div>
          </div>
        </div>

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
          <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider px-2 block font-bold">
            {role === 'patient' ? 'Care Team (PCP & Specialists)' : 'Assigned Patients Queue'}
          </span>

          {role === 'patient' ? (
            doctorsList.map((doc) => {
              const isSelected = selectedDoctor?.channelId
                ? selectedDoctor.channelId === doc.channelId
                : (selectedDoctor?.id === doc.id && selectedDoctor?.category === doc.category);

              return (
                <button
                  key={doc.channelId || `${doc.category}_${doc.id}`}
                  onClick={() => handleSelectDoctor(doc)}
                  className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center space-x-3 cursor-pointer ${
                    isSelected
                      ? 'bg-white border-emerald-600 shadow-sm ring-1 ring-emerald-500/30'
                      : 'bg-white/60 border-stone-200 hover:bg-white hover:border-stone-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-center text-xl flex-shrink-0 relative shadow-2xs">
                    {doc.photo}
                    {doc.isLeadDoctor && (
                      <Crown className="w-3.5 h-3.5 text-emerald-600 absolute -top-1 -right-1 bg-white rounded-full p-0.5 border border-emerald-400" />
                    )}
                  </div>
                  <div className="truncate flex-1">
                    <div className="flex items-center space-x-1">
                      <h4 className="text-xs font-bold text-stone-900 truncate">{doc.name}</h4>
                    </div>
                    <p className={`text-[10px] font-semibold truncate ${
                      doc.category === 'SKIN_CARE'
                        ? 'text-emerald-700'
                        : doc.category === 'HAIR_CARE'
                        ? 'text-emerald-800'
                        : 'text-amber-700'
                    }`}>
                      {doc.categoryLabel}
                    </p>
                    <span className="text-[9px] font-mono text-stone-500 block truncate">
                      {doc.hospital}
                    </span>
                  </div>
                </button>
              );
            })
          ) : (
            safePatientsList.map((pat) => (
              <button
                key={pat.id}
                onClick={() => handleSelectPatient(pat)}
                className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center space-x-3 cursor-pointer ${
                  selectedPatient.id === pat.id
                    ? 'bg-white border-emerald-600 shadow-sm ring-1 ring-emerald-500/30'
                    : 'bg-white/60 border-stone-200 hover:bg-white'
                }`}
              >
                <div className="w-10 h-10 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-center text-xl flex-shrink-0 shadow-2xs">
                  {pat.photo}
                </div>
                <div className="truncate">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-stone-900 truncate">{pat.name}</h4>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <p className="text-[10px] text-stone-500 truncate">{pat.concern}</p>
                  <span className="text-[9px] font-mono text-emerald-700">PCP: {pat.leadDoctorName}</span>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Lead Doctor Model Badge */}
        <div className="p-3 bg-stone-100 border-t border-stone-200 text-[10px] text-stone-600 space-y-1">
          <div className="flex items-center space-x-1 text-emerald-800 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>PCP Gatekeeper Security</span>
          </div>
          <p className="text-[9.5px] leading-tight text-stone-500">
            Specialist prescriptions require Lead PCP approval to prevent adverse drug interactions.
          </p>
        </div>
      </div>

      {/* MAIN CHAT CANVAS */}
      <div className="flex-1 flex flex-col h-full bg-stone-50 relative overflow-hidden">
        
        {/* DYNAMIC CHAT HEADER BANNER */}
        <div className="p-4 bg-white border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-center text-xl relative shadow-2xs">
              {role === 'patient' ? (selectedDoctor?.photo || '👩‍⚕️') : (selectedPatient?.photo || '👨')}
              {role === 'patient' && selectedDoctor?.isLeadDoctor && (
                <Crown className="w-4 h-4 text-emerald-600 absolute -top-1 -right-1" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-stone-900">
                  {role === 'patient' ? (selectedDoctor?.name || 'Lead Doctor') : (selectedPatient?.name || 'Patient')}
                </h3>
                
                {/* ROLE BADGE */}
                {role === 'patient' ? (
                  selectedDoctor?.isLeadDoctor ? (
                    <span className="px-2.5 py-0.5 bg-emerald-100/80 text-emerald-900 border border-emerald-300 rounded-full text-[9px] font-mono font-bold flex items-center space-x-1">
                      <Crown className="w-3 h-3 text-emerald-700 mr-1" />
                      <span>{selectedDoctor?.categoryLabel || 'Lead Primary Physician (PCP Gatekeeper)'}</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 bg-stone-100 text-stone-700 border border-stone-300 rounded-full text-[9px] font-mono font-bold">
                      Referred Specialist (Consultant)
                    </span>
                  )
                ) : (
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-[9px] font-mono font-bold">
                    Assigned Patient
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-3 text-[11px] text-stone-500 mt-0.5">
                <span>{role === 'patient' ? (selectedDoctor?.specialty || 'General Practice') : `Primary Concern: ${selectedPatient?.concern || 'Clinical consultation'}`}</span>
                <span>•</span>
                
                {/* DOCTOR CLINICAL AVAILABILITY */}
                {role === 'patient' && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center space-x-1 ${
                    doctorDutyStatus === 'online'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : doctorDutyStatus === 'busy'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-1 ${
                      doctorDutyStatus === 'online' ? 'bg-emerald-500 animate-pulse' : doctorDutyStatus === 'busy' ? 'bg-amber-500' : 'bg-rose-500'
                    }`} />
                    <span>{doctorDutyStatus === 'online' ? '🟢 Online & Available' : doctorDutyStatus === 'busy' ? '🟡 Busy in Consultation' : '🔴 Off-Duty'}</span>
                  </span>
                )}
                <span>•</span>

                {/* CONSULTATION STATUS */}
                <span className={`font-mono font-bold ${
                  chatroomStatus === 'CLOSED_READ_ONLY' ? 'text-rose-600' : 'text-emerald-700'
                }`}>
                  Status: {chatroomStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Action Header Buttons */}
          <div className="flex items-center space-x-2">
            {chatroomStatus !== 'CLOSED_READ_ONLY' && (
              <button
                onClick={handleCloseChatroom}
                title="End Consultation & Archive Chatroom"
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>Close Consult Session</span>
              </button>
            )}

            <button
              onClick={() => setActiveCallModal('video')}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Video Tele-Call</span>
            </button>
          </div>
        </div>

        {/* CLOSED CHAT READ-ONLY ARCHIVE BANNER */}
        {chatroomStatus === 'CLOSED_READ_ONLY' && (
          <div className="bg-amber-50 border-b border-amber-200 p-2.5 px-4 text-center text-xs text-amber-900 font-semibold flex items-center justify-center space-x-2">
            <Lock className="w-4 h-4 text-amber-600" />
            <span>This specialist consultation episode is officially CLOSED. Chat history is preserved in READ-ONLY mode.</span>
          </div>
        )}

        {/* SPECIALIST VS LEAD ACTION BAR */}
        {chatroomStatus !== 'CLOSED_READ_ONLY' && (
          <div className="px-4 py-2 bg-stone-100 border-b border-stone-200 flex items-center space-x-2 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-mono text-emerald-800 uppercase font-bold flex-shrink-0 flex items-center">
              <ShieldAlert className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              <span>Clinical Actions:</span>
            </span>

            {role === 'doctor' && !selectedDoctor.isLeadDoctor && (
              <button
                onClick={() => handleSpecialistProposeRx('Minoxidil 5% Scalp Solution', '1ml twice daily', '60 Days', 'p7', 'Trichology alopecia scalp regrowth treatment.')}
                className="px-3 py-1 bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-full flex items-center space-x-1 flex-shrink-0 transition-all shadow-2xs cursor-pointer"
              >
                <Plus className="w-3 h-3 text-emerald-600" />
                <span>Propose Specialist Rx (Minoxidil 5%) 📝</span>
              </button>
            )}

            {role === 'doctor' && selectedDoctor.isLeadDoctor && (
              <span className="text-xs text-emerald-800 font-semibold flex items-center space-x-1">
                <Crown className="w-3.5 h-3.5 text-emerald-600" />
                <span>Lead PCP Authorization Active — Review Specialist Proposals Below</span>
              </span>
            )}
          </div>
        )}

        {/* CHAT MESSAGES THREAD */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-4">
          {messages.map((msg) => {
            const isMe = (role === 'patient' && msg.sender === 'patient') || (role === 'doctor' && msg.sender === 'doctor');

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1 max-w-2xl ${
                  isMe ? 'ml-auto' : 'mr-auto'
                }`}
              >
                <div className="flex items-center space-x-2 text-[10px] text-stone-500 px-1">
                  <span className={`font-bold ${msg.isLead ? 'text-emerald-800' : 'text-stone-700'}`}>
                    {msg.senderName}
                  </span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>

                {/* TEXT MESSAGE */}
                {msg.type === 'text' && (
                  <div
                    className={`p-4 rounded-3xl text-xs leading-relaxed shadow-xs ${
                      isMe
                        ? 'bg-emerald-600 text-white rounded-tr-none font-medium'
                        : 'bg-white border border-stone-200 text-stone-800 rounded-tl-none shadow-2xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                )}

                {/* PROPOSED PRESCRIPTION CARD */}
                {msg.type === 'proposed_rx' && msg.rxProposalData && (
                  <div className={`p-5 rounded-3xl space-y-3 shadow-sm w-full max-w-md border ${
                    msg.rxProposalData.status === 'APPROVED'
                      ? 'bg-emerald-50/70 border-emerald-300'
                      : msg.rxProposalData.status === 'REJECTED'
                        ? 'bg-rose-50/70 border-rose-300'
                        : 'bg-white border-amber-300'
                  }`}>
                    <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-emerald-600" />
                        <span className="text-xs font-bold text-stone-900">Specialist Prescription Proposal</span>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                        msg.rxProposalData.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : msg.rxProposalData.status === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                      }`}>
                        {msg.rxProposalData.status === 'APPROVED'
                          ? 'APPROVED BY LEAD PCP 🟢'
                          : msg.rxProposalData.status === 'REJECTED'
                            ? 'REJECTED BY LEAD PCP 🔴'
                            : 'PROPOSED (Pending Lead Doctor Review) ⏳'}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <span className="text-[10px] font-mono text-stone-500 block">
                        Prescribed by Specialist: {msg.rxProposalData.specialistName}
                      </span>
                      <h4 className="font-bold text-emerald-900 text-sm">{msg.rxProposalData.medicineName}</h4>
                      <p className="text-stone-700 text-[11px] font-mono">Dosage: {msg.rxProposalData.dosage} ({msg.rxProposalData.duration})</p>
                      <p className="text-stone-600 text-[11px] italic">Rationale: {msg.rxProposalData.rationale}</p>
                    </div>

                    {msg.rxProposalData.status === 'PROPOSED' && (
                      <div className="pt-2 border-t border-stone-200 space-y-2">
                        {role === 'doctor' && (
                          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                            <span className="text-[10px] font-mono text-emerald-800 font-bold uppercase block flex items-center">
                              <Crown className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                              <span>Lead Primary Physician Gatekeeper Desk:</span>
                            </span>

                            <div className="flex items-center space-x-2 pt-1">
                              <button
                                onClick={() => handleLeadApproveRx(msg.id, msg.rxProposalData.productId, msg.rxProposalData.medicineName)}
                                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1 cursor-pointer"
                              >
                                <Check className="w-4 h-4" />
                                <span>Approve Rx 🟢</span>
                              </button>
                              <button
                                onClick={() => setRejectionModalRx({ msgId: msg.id, medicineName: msg.rxProposalData.medicineName })}
                                className="flex-1 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-1 cursor-pointer"
                              >
                                <Ban className="w-4 h-4 text-rose-600" />
                                <span>Reject Rx 🔴</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {role === 'patient' && (
                          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900">
                            ⏳ Submitted to Lead Primary Doctor ({selectedPatient.leadDoctorName}) for drug interaction check before pharmacy unlock.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* RX PRODUCT UNLOCK REQUEST CARD */}
                {msg.type === 'unlock_request' && msg.productData && (
                  <div className="p-5 bg-white border border-emerald-200 rounded-3xl space-y-3 shadow-sm w-full max-w-md">
                    <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                      <div className="flex items-center space-x-2">
                        <Lock className="w-5 h-5 text-emerald-600" />
                        <span className="text-xs font-bold text-stone-900">Locked Product Purchase Request</span>
                      </div>
                      <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[9px] font-mono font-bold">
                        Target: Lead PCP 👑
                      </span>
                    </div>

                    <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center space-x-3">
                      <span className="text-2xl">{msg.productData.image}</span>
                      <div className="flex-1 truncate">
                        <span className="text-[9px] font-mono text-emerald-700 uppercase font-bold block">
                          {msg.productData.category}
                        </span>
                        <h4 className="text-xs font-bold text-stone-900 truncate">{msg.productData.name}</h4>
                        <span className="text-[10px] font-mono text-emerald-700 font-bold">₹{msg.productData.price}</span>
                      </div>
                    </div>

                    <p className="text-xs text-stone-700 bg-stone-50 p-2.5 rounded-xl border border-stone-200 leading-relaxed">
                      "{msg.text}"
                    </p>

                    <div className="p-2 bg-emerald-50/70 border border-emerald-200 rounded-xl text-[10px] text-emerald-800 flex items-center space-x-1.5">
                      <Crown className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>Sent by Default to Lead Primary Doctor for Gatekeeper Approval</span>
                    </div>

                    {role === 'doctor' && (
                      <button
                        onClick={() => handleLeadApproveRx(msg.id, msg.productData.id, msg.productData.name)}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <Unlock className="w-4 h-4" />
                        <span>Approve & Unlock Product for Patient 🔓</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* D2D ERROR BANNER */}
        {d2dError && (
          <div className="mx-4 mt-2 p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start space-x-2 text-xs text-rose-800 shadow-sm">
            <ShieldX className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-rose-900 block">🚫 Access Denied (403 Forbidden)</span>
              <span>{d2dError}</span>
            </div>
            <button onClick={() => setD2dError(null)} className="text-rose-600 hover:text-rose-800 flex-shrink-0 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* INPUT BAR */}
        {role === 'doctor' && !selectedPatient?.id ? (
          <div className="p-4 bg-white border-t border-stone-200">
            <div className="flex items-center space-x-3 p-3 bg-amber-50 border border-amber-200 rounded-2xl">
              <UserX className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <span className="text-xs text-amber-900 font-semibold">
                Select a valid patient to start messaging.
              </span>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-white border-t border-stone-200 flex items-center space-x-3">
            <input
              type="text"
              id="chatroom-message-input"
              disabled={chatroomStatus === 'CLOSED_READ_ONLY'}
              placeholder={
                chatroomStatus === 'CLOSED_READ_ONLY'
                  ? "Chatroom is CLOSED in READ-ONLY mode. Inputs disabled."
                  : role === 'patient'
                    ? "Ask your Lead Physician or Specialist a health question..."
                    : "Type clinical response to patient..."
              }
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 bg-stone-50 border border-stone-300 rounded-2xl px-4 py-3 text-xs text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/15 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || chatroomStatus === 'CLOSED_READ_ONLY'}
              className="p-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold rounded-2xl shadow-xs transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* REJECT PRESCRIPTION PROPOSAL MODAL */}
      {rejectionModalRx && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center space-x-2">
                <Ban className="w-5 h-5 text-rose-600" />
                <h3 className="text-sm font-bold text-stone-900">Reject Proposed Specialist Prescription</h3>
              </div>
              <button onClick={() => setRejectionModalRx(null)} className="text-stone-400 hover:text-stone-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-600">
              Provide clinical rationale for rejecting <strong className="text-stone-900">{rejectionModalRx.medicineName}</strong> proposed by the specialist:
            </p>

            <textarea
              rows={3}
              placeholder="E.g., High risk of facial skin irritation when combined with patient's active Tretinoin retinoid application."
              value={rejectionReasonInput}
              onChange={(e) => setRejectionReasonInput(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-2xl p-3 text-xs text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:border-rose-500"
            />

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => setRejectionModalRx(null)}
                className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleLeadRejectRx}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Confirm Rejection 🔴
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIDEO CALL MODAL */}
      {activeCallModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 w-full max-w-2xl shadow-2xl space-y-6 relative flex flex-col items-center">
            <div className="w-full flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center space-x-2">
                <img src={dermAuraLogo} alt="DermAura Logo" className="w-6 h-6 object-contain" />
                <h3 className="text-base font-bold text-stone-900">DermAura HD Tele-Consultation Call</h3>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-xs font-mono font-bold">
                ● 02:45 Connected
              </span>
            </div>

            <div className="w-full h-72 rounded-2xl bg-stone-900 relative overflow-hidden flex items-center justify-center">
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-stone-900 via-stone-800 to-emerald-950 text-center p-6 space-y-3">
                <div className="w-24 h-24 rounded-full bg-emerald-600/30 border-2 border-emerald-400 flex items-center justify-center text-4xl shadow-2xl animate-pulse">
                  {role === 'patient' ? (selectedDoctor?.photo || '👩‍⚕️') : (selectedPatient?.photo || '👨')}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">
                    {role === 'patient' ? (selectedDoctor?.name || 'Lead Doctor') : (selectedPatient?.name || 'Patient')}
                  </h4>
                  <p className="text-xs text-emerald-300 font-mono">1080p Encrypted Medical Stream Active</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveCallModal(null)}
              className="px-6 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-full shadow-md shadow-rose-600/20 flex items-center space-x-2 transition-all cursor-pointer"
            >
              <PhoneOff className="w-5 h-5" />
              <span>End Call</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
