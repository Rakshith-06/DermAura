import React, { useState, useEffect } from 'react';
import { API_BASE } from '../api.js';
import HealthChatroom from './HealthChatroom';
import DoctorProfilePage from './DoctorProfilePage';
import IndividualPatientProfileView from './IndividualPatientProfileView';
import AutoReportBanner from './AutoReportBanner';
import {
  Stethoscope,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Scan,
  Plus,
  Search,
  Video,
  Phone,
  ShieldCheck,
  Activity,
  Award,
  TrendingUp,
  Send,
  X,
  Edit,
  Check,
  Lock,
  Unlock,
  HeartPulse,
  Bot,
  Sparkles,
  User,
  Calendar,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Filter,
  MessageSquare,
  FileSpreadsheet,
  Zap,
  ArrowUpRight,
  CheckCircle,
  Eye,
  Pencil,
  RotateCcw,
  ShieldAlert,
  Trash2,
  PlusCircle,
  Bell,
  Brain,
  Download,
  Printer
} from 'lucide-react';

export default function DoctorDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'queue' | 'scans' | 'prescriptions' | 'profile'
  const [dutyStatus, setDutyStatus] = useState(() => {
    try {
      return localStorage.getItem('dermaura_doctor_duty_status') || 'online';
    } catch (e) {
      return 'online';
    }
  });

  const handleDutyStatusChange = (newStatus) => {
    setDutyStatus(newStatus);
    try {
      localStorage.setItem('dermaura_doctor_duty_status', newStatus);
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('dermaura_duty_status_changed', { detail: newStatus }));
    } catch (e) {}
  };

  // Automatically switch duty status to 'online' upon doctor login / portal entry
  useEffect(() => {
    handleDutyStatusChange('online');
  }, []);

  const handleDoctorLogout = () => {
    handleDutyStatusChange('offline');
    if (onLogout) {
      onLogout();
    }
  };
  const [activeChatPatientId, setActiveChatPatientId] = useState('p-101');

  // Patient Appointments & Queue State
  const [patients, setPatients] = useState([
    {
      id: 'p-101',
      name: 'Aarav Sharma',
      age: 26,
      gender: 'Male',
      photo: '👨',
      time: '10:30 AM',
      type: 'Video Tele-Consult',
      concern: 'Severe Facial Acne Vulgaris & Inflammatory Papules',
      anatomicRegion: 'Malar Cheeks & T-Zone',
      urgency: 'High',
      status: 'Waiting in Queue',
      bloodGroup: 'O+',
      allergies: ['Penicillin'],
      aiTriage: 'Acne Vulgaris (95.4% AI Match)',
      scansUploaded: 2,
    },
    {
      id: 'p-102',
      name: 'Priya Patel',
      age: 31,
      gender: 'Female',
      photo: '👩',
      time: '11:15 AM',
      type: 'Chat Consult',
      concern: 'Scalp Seborrheic Dermatitis & Hair Thinning',
      anatomicRegion: 'Scalp Vertex',
      urgency: 'Medium',
      status: 'Ready for Review',
      bloodGroup: 'A+',
      allergies: ['None'],
      aiTriage: 'Seborrheic Dermatitis (96.2% AI Match)',
      scansUploaded: 1,
    },
    {
      id: 'p-103',
      name: 'Rohan Verma',
      age: 42,
      gender: 'Male',
      photo: '👨‍💼',
      time: '12:00 PM',
      type: 'Video Tele-Consult',
      concern: 'Facial Inflammatory Erythema & Capillary Flushing',
      anatomicRegion: 'Bilateral Cheeks',
      urgency: 'Low',
      status: 'Scheduled',
      bloodGroup: 'B+',
      allergies: ['Sulfa Drugs'],
      aiTriage: 'Erythematotelangiectatic Flare (93.8% AI Match)',
      scansUploaded: 1,
    },
    {
      id: 'p-104',
      name: 'Sneha Reddy',
      age: 24,
      gender: 'Female',
      photo: '👩‍🦰',
      time: '02:30 PM',
      type: 'Prescription Renewal',
      concern: 'Tretinoin 0.05% Refill & Progress Evaluation',
      anatomicRegion: 'Facial Skin',
      urgency: 'Low',
      status: 'Prescription Pending',
      bloodGroup: 'AB+',
      allergies: ['None'],
      aiTriage: 'Post-Acne Hyperpigmentation',
      scansUploaded: 3,
    }
  ]);

  // AI Scans Awaiting Verification with Patient Avoid Advisories
  const [aiScans, setAiScans] = useState([
    {
      id: 'scan-801',
      patientName: 'Aarav Sharma',
      scanDate: 'Today, 09:45 AM',
      image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600&auto=format&fit=crop&q=60',
      predictedCondition: 'Facial Acne Vulgaris (Grade II Inflammatory)',
      confidence: '95.4%',
      severity: 'Moderate Inflammatory',
      anatomicRegion: 'Malar Cheeks & T-Zone',
      sebumIndex: '7.8 / 10 (Elevated Sebum Output)',
      cortisolRisk: 'High Neuro-Skin Flare Risk (75% Cortisol Index)',
      visualMarkers: [
        '8-12 Inflammatory Papules in Malar cheek area',
        'Dense Micro-Comedones across nasal bridge & T-Zone',
        'Mild Post-Inflammatory Hyperpigmentation (PIH)'
      ],
      aiRecommendation: 'Nighttime Topical Retinoid (Tretinoin 0.05%) + Gentle Non-Comedogenic Hydrating Cleanser',
      status: 'Pending Doctor Sign-off',
      avoidSuggestions: [
        'Avoid picking or popping facial acne papules',
        'Avoid heavy oil-based facial moisturizers',
        'Avoid harsh physical scrub exfoliants'
      ]
    },
    {
      id: 'scan-802',
      patientName: 'Priya Patel',
      scanDate: 'Today, 10:10 AM',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=60',
      predictedCondition: 'Scalp Seborrheic Dermatitis & Hair Shedding',
      confidence: '96.2%',
      severity: 'Moderate to High',
      anatomicRegion: 'Occipital & Parietal Scalp Hairline',
      sebumIndex: '8.4 / 10 (Severe Seborrhea)',
      cortisolRisk: 'Elevated Stress Flare Correlation (68% Cortisol Index)',
      visualMarkers: [
        'Erythematous Scalp Plaques with greasy yellowish scaling',
        'Perifollicular Inflammation near anterior hairline',
        'Increased Telogen Phase Hair Shedding'
      ],
      aiRecommendation: 'Ketoconazole 2% Scalp Solution twice weekly + Minoxidil 5% topical solution',
      status: 'Pending Doctor Sign-off',
      avoidSuggestions: [
        'Avoid hot water scalp washes',
        'Avoid heavy comedogenic hair oils on scalp',
        'Avoid fingernail scratching on inflamed scalp'
      ]
    },
    {
      id: 'scan-803',
      patientName: 'Rohan Verma',
      scanDate: 'Yesterday, 04:30 PM',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=60',
      predictedCondition: 'Facial Inflammatory Erythema & Rosacea',
      confidence: '93.8%',
      severity: 'Mild Vascular Erythema',
      anatomicRegion: 'Bilateral Cheeks & Nasal Ala',
      sebumIndex: '5.2 / 10 (Normal Sebum Level)',
      cortisolRisk: 'Low Systemic Stress Correlation (32% Cortisol Index)',
      visualMarkers: [
        'Central Facial Flushing & Telangiectasia',
        'Elevated Skin Surface Temperature',
        'Impaired Epidermal Moisture Barrier'
      ],
      aiRecommendation: 'Soothing Barrier Repair Moisturizer + Azelaic Acid 10% topical cream',
      status: 'Verified by Doctor',
      avoidSuggestions: [
        'Avoid direct UV sun exposure without mineral SPF 50+',
        'Avoid alcohol-based facial toners',
        'Avoid intense thermal steam exposure'
      ]
    }
  ]);

  // E-Prescriptions Issued
  const [prescriptions, setPrescriptions] = useState([
    {
      id: 'rx-501',
      patientName: 'Aarav Sharma',
      date: 'Today',
      medicines: [
        { name: 'Tretinoin 0.05% Gel', dosage: 'Apply at night on clean face', duration: '30 Days' },
        { name: 'DermAura Gentle Cleanser', dosage: 'Twice daily', duration: 'Daily' }
      ],
      notes: 'Avoid direct sunlight after applying retinoid. Use mineral sunscreen SPF 50+.',
      status: 'Issued & Unlocked 🔓'
    },
    {
      id: 'rx-502',
      patientName: 'Priya Patel',
      date: 'Yesterday',
      medicines: [
        { name: 'Ketoconazole 2% Scalp Solution', dosage: 'Twice weekly scalp wash', duration: '4 Weeks' },
        { name: 'Minoxidil 5% Solution', dosage: '1ml twice daily on scalp', duration: '60 Days' }
      ],
      notes: 'Rinse thoroughly after 5 mins. Do not use hot water on scalp.',
      status: 'Issued & Unlocked 🔓'
    }
  ]);

  // Sidebar Collapsible & Tooltip State
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Active Interactive Modals
  const [activeConsultationPatient, setActiveConsultationPatient] = useState(null);
  const [prescriptionModalPatient, setPrescriptionModalPatient] = useState(null);
  const [selectedScanForReview, setSelectedScanForReview] = useState(null);
  const [avoidModalScan, setAvoidModalScan] = useState(null);
  const [newAvoidItemInput, setNewAvoidItemInput] = useState('');
  const [notificationToast, setNotificationToast] = useState(null);

  // Shared Patient Stress Report State & Modal
  const [showFullStressModal, setShowFullStressModal] = useState(null);

  const defaultStressReport = {
    patientName: 'Aarav Sharma',
    patientEmail: 'patient@dermaura.com',
    score: 15,
    maxPts: 20,
    percentage: 75,
    category: 'High Cortisol Flare Risk (High Stress)',
    badgeColor: 'bg-rose-950 text-rose-300 border-rose-800',
    summary: 'Elevated systemic stress detected. High clinical correlation with inflammatory facial acne papules, scalp seborrheic flares, and hair shedding.',
    recommendations: [
      'Prioritize 7-8 hours of uninterrupted sleep to regulate serum cortisol.',
      'Share this report with your DermAura Dermatologist for targeted anti-inflammatory skincare advice.',
      'Incorporate 15 minutes of mindfulness or light evening walks.'
    ],
    detailedAnswers: [
      {
        id: 'q1',
        question: '1. How frequently do you experience sleep disruption or insomnia?',
        selectedOption: 'Frequent (3-4 nights a week)',
        pts: 3
      },
      {
        id: 'q2',
        question: '2. How often do you feel under intense mental pressure or anxiety?',
        selectedOption: 'High workload & frequent stress',
        pts: 3
      },
      {
        id: 'q3',
        question: '3. Do your facial skin breakouts or scalp itching flare during stressful weeks?',
        selectedOption: 'Severe acute skin outbreaks & hair shedding',
        pts: 4
      },
      {
        id: 'q4',
        question: '4. How much daily time do you dedicate to relaxation, exercise, or mindfulness?',
        selectedOption: 'Under 15 minutes daily',
        pts: 3
      },
      {
        id: 'q5',
        question: '5. Do you experience physical fatigue, tension headaches, or jaw clenching?',
        selectedOption: 'Frequently during stressful periods',
        pts: 2
      }
    ],
    sharedAt: '10:15 AM'
  };

  const [sharedStressReport, setSharedStressReport] = useState(defaultStressReport);

  // ── Auto-routed report state (fed by AutoReportBanner polling) ────────────
  const [autoScanReport,   setAutoScanReport]   = useState(null);
  const [autoStressReport, setAutoStressReport] = useState(null);
  // Count of unreviewed auto-routed reports (drives sidebar badge)
  const [autoReportCount,  setAutoReportCount]  = useState(0);

  // Download / Print Formatted PDF Clinical Tele-Health Report
  const handleDownloadReportPDF = (scan = null, stressReport = null, targetPatient = null) => {
    const pt = targetPatient || (scan ? patients.find(p => p.name.toLowerCase() === scan.patientName.toLowerCase()) : null) || patients[0];
    const scanData = scan || aiScans[0];
    const stressData = stressReport || sharedStressReport || defaultStressReport;

    const printWindow = window.open('', '_blank', 'width=900,height=1100');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>DermAura Clinical Tele-Health Report - ${pt.name}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0f172a; padding: 40px; margin: 0; background: #ffffff; line-height: 1.5; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #0d9488; padding-bottom: 16px; margin-bottom: 24px; }
            .brand { font-size: 26px; font-weight: 900; color: #0d9488; letter-spacing: -0.5px; }
            .subtitle { font-size: 11px; color: #64748b; font-family: monospace; text-transform: uppercase; margin-top: 2px; }
            .sec-header { font-size: 13px; font-weight: 800; color: #0f172a; border-left: 4px solid #0d9488; padding-left: 10px; margin-top: 24px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
            .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0; font-size: 12px; }
            .grid-item { display: flex; justify-content: space-between; }
            .lbl { color: #64748b; font-weight: 600; }
            .val { font-weight: 700; color: #0f172a; }
            .card { background: #f8fafc; border: 1px solid #cbd5e1; padding: 16px; border-radius: 12px; font-size: 12px; margin-bottom: 16px; }
            .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; background: #ccfbf1; color: #0f766e; border: 1px solid #99f6e4; }
            .badge-danger { background: #ffe4e6; color: #be123c; border: 1px solid #fecdd3; }
            .q-list { list-style: none; padding: 0; margin: 8px 0 0 0; }
            .q-item { padding: 8px 12px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 6px; font-size: 11px; }
            .doctor-sig { margin-top: 40px; padding-top: 20px; border-top: 2px solid #cbd5e1; display: flex; justify-content: space-between; font-size: 12px; }
            @media print {
              body { padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="brand">✨ DermAura Tele-Health</div>
              <div class="subtitle">Official AI DermScan & Stress Analyzer Clinical Assessment Report</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 12px; font-weight: 800; color: #0f172a;">Date: ${new Date().toLocaleDateString()}</div>
              <div class="subtitle">Doc Reference: #${scanData?.id || 'DS-801'}</div>
            </div>
          </div>

          <div class="sec-header">1. Patient Demographic & PCP Gatekeeper Metadata</div>
          <div class="grid-2">
            <div class="grid-item"><span class="lbl">Patient Name:</span> <span class="val">${pt.name}</span></div>
            <div class="grid-item"><span class="lbl">Age & Gender:</span> <span class="val">${pt.age} Yrs, ${pt.gender}</span></div>
            <div class="grid-item"><span class="lbl">Blood Group:</span> <span class="val">${pt.bloodGroup || 'O+'}</span></div>
            <div class="grid-item"><span class="lbl">Attending Lead Doctor:</span> <span class="val">${user.fullName || 'Dr. Sarah Jenkins'}</span></div>
            <div class="grid-item"><span class="lbl">Known Allergies:</span> <span class="val">${Array.isArray(pt.allergies) ? pt.allergies.join(', ') : pt.allergies}</span></div>
            <div class="grid-item"><span class="lbl">Primary Diagnosis:</span> <span class="val">${pt.concern}</span></div>
          </div>

          <div class="sec-header">2. AI DermScan Visual Lesion Analysis & Triage</div>
          <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <strong style="font-size: 15px; color: #0f766e;">Predicted Condition: ${scanData?.predictedCondition || pt.concern}</strong>
              <span class="badge">AI Confidence: ${scanData?.confidence || '95.4%'}</span>
            </div>
            <p style="margin: 4px 0;"><strong>Severity Rating:</strong> ${scanData?.severity || 'Moderate'}</p>
            <p style="margin: 4px 0;"><strong>Target Anatomic Region:</strong> ${scanData?.anatomicRegion || pt.anatomicRegion || 'Malar Cheeks & T-Zone'}</p>
            <p style="margin: 4px 0;"><strong>Sebum Production Output:</strong> ${scanData?.sebumIndex || '7.8 / 10'}</p>
            <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid #e2e8f0;">
              <strong>Detected Visual Markers:</strong>
              <ul style="margin: 4px 0 0 0; padding-left: 20px; font-size: 11px;">
                ${(scanData?.visualMarkers || ['8-12 Inflammatory Papules', 'Dense Micro-Comedones in T-Zone', 'Mild PIH']).map(m => `<li>${m}</li>`).join('')}
              </ul>
            </div>
          </div>

          <div class="sec-header">3. Stress Analyzer Quiz & Cortisol Flare Assessment</div>
          <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <strong>Cortisol Stress Score: ${stressData?.score || 15} / ${stressData?.maxPts || 20} (${stressData?.percentage || 75}%)</strong>
              <span class="badge badge-danger">${stressData?.category || 'High Cortisol Flare Risk'}</span>
            </div>
            <p style="margin-bottom: 12px; font-style: italic; color: #334155; font-size: 11px;">"${stressData?.summary || 'Elevated systemic stress detected.'}"</p>
            
            <div style="font-weight: 700; margin-bottom: 8px; font-size: 11px; text-transform: uppercase; color: #475569;">Patient Quiz Responses:</div>
            <div class="q-list">
              ${(stressData?.detailedAnswers || []).map(q => `
                <div class="q-item">
                  <div style="font-weight: 700; color: #1e293b;">${q.question}</div>
                  <div style="color: #0d9488; margin-top: 2px;">• Selected Option: <strong>${q.selectedOption}</strong> (+${q.pts} pts)</div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="sec-header">4. Clinical Care Guidance & Avoid Cautions</div>
          <div class="card">
            <p style="margin: 4px 0;"><strong>Recommended Regimen:</strong> ${scanData?.aiRecommendation || 'Topical Retinoid + Gentle Hydrating Cleanser'}</p>
            <p style="margin: 6px 0 0 0;"><strong>Things to Avoid:</strong> ${(scanData?.avoidSuggestions || []).join(', ')}</p>
          </div>

          <div class="doctor-sig">
            <div>
              <div><strong>Verified & Signed By:</strong> ${user.fullName || 'Dr. Sarah Jenkins'}</div>
              <div style="color: #64748b; font-size: 10px;">License: MCI-98421-B • DermAura Tele-Health Network</div>
            </div>
            <div style="text-align: right;">
              <div><strong>Digital Clinical Signature:</strong> Verified 🟢</div>
              <div style="color: #64748b; font-size: 10px;">Timestamp: ${new Date().toLocaleString()}</div>
            </div>
          </div>

          <div class="no-print" style="margin-top: 30px; text-align: center;">
            <button onclick="window.print()" style="padding: 12px 28px; background: #0d9488; color: #fff; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 13px;">📥 Save / Print PDF Report</button>
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Doctor Pharmacy & Product Unlock Security Roster
  const doctorPharmacyProducts = [
    { id: 'p1', name: 'DermAura Hydrating Gentle Facial Moisturizer', category: 'Facial Skin Care', price: 499, image: '🧴', isOrganic: false },
    { id: 'p2', name: 'Broad Spectrum Facial Mineral Sunscreen SPF 50+', category: 'Facial Sun Protection', price: 650, image: '☀️', isOrganic: false },
    { id: 'p3', name: 'Sulfate-Free Hair & Scalp Strengthening Shampoo', category: 'Hair & Scalp Care', price: 599, image: '🧴', isOrganic: true },
    { id: 'p4', name: '100% Organic Soothing Aloe Facial & Scalp Gel', category: 'Facial & Scalp Care', price: 299, image: '🌱', isOrganic: true },
    { id: 'p5', name: 'Hydrocortisone 1% Facial Dermatitis Cream', category: 'Prescription Facial Medicine', price: 340, image: '💊', isOrganic: false },
    { id: 'p6', name: 'Tretinoin 0.05% Facial Acne & Retinoid Gel', category: 'Prescription Facial Medicine', price: 890, image: '🧪', isOrganic: false },
    { id: 'p7', name: 'Minoxidil 5% Hair & Scalp Regrowth Solution', category: 'Hair & Scalp Rx', price: 1150, image: '💧', isOrganic: false },
    { id: 'p8', name: 'Ketoconazole 2% Scalp Anti-Dandruff Solution', category: 'Hair & Scalp Rx', price: 420, image: '🧴', isOrganic: false },
  ];

  const [unlockedProducts, setUnlockedProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('dermaura_unlocked_products');
      return saved ? JSON.parse(saved) : ['p3', 'p4'];
    } catch (e) {
      return ['p3', 'p4'];
    }
  });

  const [unlockRequests, setUnlockRequests] = useState(() => {
    try {
      const saved = localStorage.getItem('dermaura_doctor_chat_requests');
      return saved ? JSON.parse(saved) : [
        {
          id: 'req_demo1',
          patientName: 'Aarav Sharma',
          productId: 'p6',
          productName: 'Tretinoin 0.05% Facial Acne & Retinoid Gel',
          productPrice: 890,
          productImage: '🧪',
          doctorName: 'Dr. Ananya Patel, MD',
          timestamp: '10:20 AM',
          message: 'Hello Doctor, I request clinical evaluation and prescription unlock for Tretinoin 0.05% Gel for my facial acne.',
          status: 'Pending Doctor Review ⏳'
        }
      ];
    } catch (e) {
      return [];
    }
  });

  // Patient Selection Product Unlock Modal State
  const [unlockModalState, setUnlockModalState] = useState(null); // { prod, reqId }
  const [selectedPatientForUnlock, setSelectedPatientForUnlock] = useState('p-101');
  const [unlockAuthNote, setUnlockAuthNote] = useState('');

  const [doctorNotificationsOpen, setDoctorNotificationsOpen] = useState(false);
  const [sessionRequests, setSessionRequests] = useState(() => {
    try {
      const saved = localStorage.getItem('dermaura_session_requests');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [selectedPatientProfile, setSelectedPatientProfile] = useState(null);

  useEffect(() => {
    const syncDoctorData = () => {
      try {
        const savedUnlocks = localStorage.getItem('dermaura_unlocked_products');
        if (savedUnlocks) setUnlockedProducts(JSON.parse(savedUnlocks));

        const savedReqs = localStorage.getItem('dermaura_doctor_chat_requests');
        if (savedReqs) setUnlockRequests(JSON.parse(savedReqs));

        const savedSessions = localStorage.getItem('dermaura_session_requests');
        if (savedSessions) setSessionRequests(JSON.parse(savedSessions));

        // ── Sync auto-routed clinical reports ─────────────────────────────
        const scanRaw = localStorage.getItem('dermaura_auto_scan_report');
        if (scanRaw) {
          const parsed = JSON.parse(scanRaw);
          setAutoScanReport(prev => (prev?.id === parsed.id ? prev : parsed));
        }
        const stressRaw = localStorage.getItem('dermaura_shared_stress_report');
        if (stressRaw) {
          const parsed = JSON.parse(stressRaw);
          setAutoStressReport(prev => (prev?.id === parsed.id ? prev : parsed));
          setSharedStressReport(parsed);
        }
        // Update unread badge: count non-null auto reports
        const scanExists   = !!localStorage.getItem('dermaura_auto_scan_report');
        const stressExists = !!localStorage.getItem('dermaura_shared_stress_report');
        setAutoReportCount((scanExists ? 1 : 0) + (stressExists ? 1 : 0));
      } catch (e) {}
    };
    syncDoctorData(); // run once on mount
    window.addEventListener('storage', syncDoctorData);
    const interval = setInterval(syncDoctorData, 1500);
    return () => {
      window.removeEventListener('storage', syncDoctorData);
      clearInterval(interval);
    };
  }, []);

  const handleDoctorAcceptSession = async (reqId) => {
    try {
      await fetch(`${API_BASE}/api/consultations/${reqId}/accept`, {
        method: 'PATCH',
      });
    } catch (e) {}

    const updated = sessionRequests.map((r) =>
      r.id === reqId ? { ...r, status: 'ACCEPTED' } : r
    );
    setSessionRequests(updated);
    try {
      localStorage.setItem('dermaura_session_requests', JSON.stringify(updated));
    } catch (e) {}

    setNotificationToast('🟢 Session Request Accepted! Live Tele-Consultation Meet Started.');
    setTimeout(() => setNotificationToast(null), 4000);
    setDoctorNotificationsOpen(false);
    setActiveTab('doctor-chat');
  };

  const handleOpenUnlockModal = (prod, reqId = null, patientName = null) => {
    setUnlockModalState({ prod, reqId });
    const matchedPt = patients.find(p => p.name === patientName) || patients[0];
    setSelectedPatientForUnlock(matchedPt ? matchedPt.id : (patients[0]?.id || 'p-101'));
    setUnlockAuthNote('Approved for clinical treatment regimen.');
  };

  const handleConfirmPatientUnlock = () => {
    if (!unlockModalState) return;
    const { prod, reqId } = unlockModalState;
    const targetPatient = patients.find(p => p.id === selectedPatientForUnlock) || patients[0];
    const patientName = targetPatient?.name || 'Patient';

    const updatedUnlocks = Array.from(new Set([...unlockedProducts, prod.id]));
    setUnlockedProducts(updatedUnlocks);
    localStorage.setItem('dermaura_unlocked_products', JSON.stringify(updatedUnlocks));

    if (reqId) {
      const updatedReqs = unlockRequests.map(r => r.id === reqId ? { ...r, status: `UNLOCKED for ${patientName} 🔓` } : r);
      setUnlockRequests(updatedReqs);
      localStorage.setItem('dermaura_doctor_chat_requests', JSON.stringify(updatedReqs));
    }

    setNotificationToast(`🔓 "${prod.name}" successfully unlocked for patient ${patientName}!`);
    setTimeout(() => setNotificationToast(null), 4500);

    setUnlockModalState(null);
  };

  const handleDoctorUnlockProduct = (productId, reqId = null) => {
    const prod = doctorPharmacyProducts.find(p => p.id === productId) || { id: productId, name: productId, price: 500, image: '💊', category: 'Prescription' };
    handleOpenUnlockModal(prod, reqId);
  };

  const handleDoctorLockProduct = (productId) => {
    const updatedUnlocks = unlockedProducts.filter(id => id !== productId);
    setUnlockedProducts(updatedUnlocks);
    localStorage.setItem('dermaura_unlocked_products', JSON.stringify(updatedUnlocks));

    const prod = doctorPharmacyProducts.find(p => p.id === productId);
    setNotificationToast(`🔒 Product "${prod?.name || productId}" is now locked for patients.`);
    setTimeout(() => setNotificationToast(null), 4000);
  };

  // E-Prescription Form Builder State
  const [newRxMedicine, setNewRxMedicine] = useState('Tretinoin 0.05% Facial Acne & Retinoid Gel');
  const [newRxDosage, setNewRxDosage] = useState('Apply small pea-sized amount at night');
  const [newRxDuration, setNewRxDuration] = useState('4 Weeks');
  const [newRxNotes, setNewRxNotes] = useState('Use gentle moisturizer prior to application if redness occurs. Avoid eye contour.');
  const [customMedicineList, setCustomMedicineList] = useState([]);

  // Toast Helper
  const showToast = (msg) => {
    setNotificationToast(msg);
    setTimeout(() => setNotificationToast(null), 4000);
  };

  // Add Medicine to Prescription Form
  const handleAddMedicineToRx = () => {
    if (!newRxMedicine) return;
    setCustomMedicineList((prev) => [
      ...prev,
      { name: newRxMedicine, dosage: newRxDosage, duration: newRxDuration }
    ]);
    setNewRxMedicine('Hydrocortisone 1% Facial Dermatitis Cream');
    setNewRxDosage('Apply to affected facial areas twice daily for 7 days');
  };

  // Submit Prescription
  const handleIssuePrescription = () => {
    if (!prescriptionModalPatient) return;
    const finalMeds = customMedicineList.length > 0 ? customMedicineList : [
      { name: newRxMedicine, dosage: newRxDosage, duration: newRxDuration }
    ];

    const newRx = {
      id: `rx-${Date.now().toString().slice(-3)}`,
      patientName: prescriptionModalPatient.name,
      date: 'Just Now',
      medicines: finalMeds,
      notes: newRxNotes,
      status: 'Issued & Unlocked 🔓'
    };

    setPrescriptions((prev) => [newRx, ...prev]);
    
    // Update patient status
    setPatients((prev) =>
      prev.map((p) =>
        p.id === prescriptionModalPatient.id ? { ...p, status: 'Consultation Completed & Rx Issued' } : p
      )
    );

    showToast(`Prescription successfully signed and issued to ${prescriptionModalPatient.name}! Unlocked in DermPharmacy.`);
    setPrescriptionModalPatient(null);
    setCustomMedicineList([]);
  };

  // Approve Scan Triage
  const handleApproveScan = (scanId) => {
    setAiScans((prev) =>
      prev.map((s) => (s.id === scanId ? { ...s, status: 'Verified by Doctor' } : s))
    );
    showToast('AI DermScan triage verified and signed off by Doctor.');
    setSelectedScanForReview(null);
  };

  // UNDO Verification Sign-off (Revoke accidental sign-off)
  const handleUndoVerification = (scanId) => {
    setAiScans((prev) =>
      prev.map((s) => (s.id === scanId ? { ...s, status: 'Pending Doctor Sign-off' } : s))
    );
    showToast('Accidental verification undone! DermScan reset back to Pending Doctor Sign-off.');
  };

  // Avoid Item Handlers
  const handleAddAvoidItem = () => {
    if (!newAvoidItemInput.trim() || !avoidModalScan) return;
    const updatedList = [...(avoidModalScan.avoidSuggestions || []), newAvoidItemInput.trim()];
    setAvoidModalScan({ ...avoidModalScan, avoidSuggestions: updatedList });
    setAiScans((prev) =>
      prev.map((s) => (s.id === avoidModalScan.id ? { ...s, avoidSuggestions: updatedList } : s))
    );
    setNewAvoidItemInput('');
    showToast('Added clinical caution advisory (Things to Avoid) for patient.');
  };

  const handleRemoveAvoidItem = (index) => {
    if (!avoidModalScan) return;
    const updatedList = (avoidModalScan.avoidSuggestions || []).filter((_, i) => i !== index);
    setAvoidModalScan({ ...avoidModalScan, avoidSuggestions: updatedList });
    setAiScans((prev) =>
      prev.map((s) => (s.id === avoidModalScan.id ? { ...s, avoidSuggestions: updatedList } : s))
    );
  };

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 font-sans overflow-hidden selection:bg-indigo-500 selection:text-white">
      
      {/* Toast Notification */}
      {notificationToast && (
        <div className="absolute top-16 right-6 z-50 p-4 bg-indigo-950 border border-indigo-700 rounded-2xl shadow-2xl text-xs text-indigo-200 flex items-center space-x-3 max-w-md animate-in slide-in-from-top">
          <CheckCircle2 className="w-5 h-5 text-indigo-400 flex-shrink-0" />
          <span>{notificationToast}</span>
        </div>
      )}

      {/* LEFT SIDEBAR - DOCTOR COMMAND PORTAL */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 bg-slate-900/95 border-r border-slate-800 flex flex-col justify-between z-[60] relative shadow-2xl h-full flex-shrink-0`}>
        
        {/* Floating Expand Sidebar Button when Collapsed (z-[100] on sidebar right border) */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            title="Expand Sidebar"
            className="absolute -right-3.5 top-4 z-[100] w-7 h-7 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white border-2 border-slate-900 shadow-xl flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all group"
          >
            <ChevronRight className="w-4 h-4 text-white" />
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-slate-900 border border-slate-700/90 text-slate-100 text-xs font-semibold rounded-xl shadow-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 z-[100] whitespace-nowrap">
              <span>Expand Sidebar</span>
            </div>
          </button>
        )}

        <div className="flex flex-col h-full justify-between">
          
          {/* Top Section (Brand, Status, Nav Links, Scope) */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {/* Header Brand */}
            <div className="p-3.5 border-b border-slate-800/60 flex items-center justify-between min-h-[57px]">
              {sidebarOpen ? (
                <>
                  <div className="flex items-center space-x-2.5 text-left group">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-teal-400 flex items-center justify-center font-bold text-white shadow-md group-hover:shadow-indigo-500/40 group-hover:scale-105 transition-all flex-shrink-0">
                      <Stethoscope className="w-5 h-5 text-white" />
                    </div>
                    <div className="truncate">
                      <span className="font-extrabold text-base tracking-tight text-white block truncate">
                        Derm<span className="text-indigo-400">Aura</span> MD
                      </span>
                      <span className="text-[9px] text-teal-400 font-mono block">Doctor Clinical Portal</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSidebarOpen(false)}
                    title="Collapse Sidebar"
                    className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer hover:scale-105"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="w-full flex items-center justify-center">
                  <div className="relative group">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-teal-400 flex items-center justify-center font-bold text-white shadow-md group-hover:scale-105 transition-transform flex-shrink-0">
                      <Stethoscope className="w-5 h-5 text-white" />
                    </div>
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-slate-900 border border-slate-700/90 text-slate-100 text-xs font-semibold rounded-xl shadow-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 z-[80] whitespace-nowrap flex items-center space-x-1.5">
                      <Stethoscope className="w-3.5 h-3.5 text-indigo-400" />
                      <span>DermAura MD Doctor Clinical Portal</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Doctor Status Widget */}
            <div className="p-2 relative group border-b border-slate-800/60">
              {sidebarOpen ? (
                <div className="p-2 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Clinical Availability</span>
                    <span className={`w-2 h-2 rounded-full ${
                      dutyStatus === 'online' ? 'bg-emerald-400 animate-pulse' : dutyStatus === 'busy' ? 'bg-amber-400' : 'bg-rose-500'
                    }`} />
                  </div>
                  <select
                    value={dutyStatus}
                    onChange={(e) => handleDutyStatusChange(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-indigo-300 font-semibold focus:outline-none focus:border-indigo-500"
                  >
                    <option value="online">🟢 Online for Tele-Consults</option>
                    <option value="busy">🟡 In Surgery / Clinic Consultation</option>
                    <option value="offline">🔴 Offline / Off Duty</option>
                  </select>
                </div>
              ) : (
                <div className="relative group mx-auto flex justify-center py-1">
                  <span className={`w-3 h-3 rounded-full ${
                    dutyStatus === 'online' ? 'bg-emerald-400 animate-pulse' : dutyStatus === 'busy' ? 'bg-amber-400' : 'bg-rose-500'
                  }`} />
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-slate-900 border border-slate-700/90 text-slate-100 text-xs font-semibold rounded-xl shadow-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 whitespace-nowrap">
                    <span>Status: {dutyStatus === 'online' ? '🟢 Online' : dutyStatus === 'busy' ? '🟡 Busy' : '🔴 Offline'}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Links */}
            <div className="px-2 py-2 space-y-1">
              <div className="relative group">
                <button
                  onClick={() => setActiveTab('overview')}
                  title="Doctor Command Center"
                  className={`w-full py-2 px-3 rounded-xl text-xs font-medium flex items-center ${
                    sidebarOpen ? 'justify-start space-x-3' : 'justify-center'
                  } transition-all ${
                    activeTab === 'overview' ? 'bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <Activity className="w-4 h-4 flex-shrink-0 text-indigo-400" />
                  {sidebarOpen && <span>Doctor Command Center</span>}
                </button>
                {!sidebarOpen && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-slate-900 border border-slate-700/90 text-slate-100 text-xs font-semibold rounded-xl shadow-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 whitespace-nowrap flex items-center space-x-1.5">
                    <Activity className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Doctor Command Center</span>
                  </div>
                )}
              </div>

              <div className="relative group">
                <button
                  onClick={() => setActiveTab('doctor-chat')}
                  title="Patient Tele-Chatroom"
                  className={`w-full py-2 px-3 rounded-xl text-xs font-medium flex items-center ${
                    sidebarOpen ? 'justify-start space-x-3' : 'justify-center'
                  } transition-all ${
                    activeTab === 'doctor-chat' ? 'bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30' : 'text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 flex-shrink-0 text-indigo-400" />
                  {sidebarOpen && (
                    <div className="flex items-center justify-between w-full">
                      <span>Patient Chatroom</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 animate-pulse">
                        Live
                      </span>
                    </div>
                  )}
                </button>
                {!sidebarOpen && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-slate-900 border border-slate-700/90 text-slate-100 text-xs font-semibold rounded-xl shadow-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 whitespace-nowrap flex items-center space-x-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Patient Tele-Chatroom</span>
                  </div>
                )}
              </div>

              <div className="relative group">
                <button
                  onClick={() => setActiveTab('queue')}
                  title="Patient Queue"
                  className={`w-full py-2 px-3 rounded-xl text-xs font-medium flex items-center ${
                    sidebarOpen ? 'justify-start space-x-3' : 'justify-center'
                  } transition-all ${
                    activeTab === 'queue' ? 'bg-teal-500/20 text-teal-300 font-semibold border border-teal-500/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <Users className="w-4 h-4 flex-shrink-0 text-teal-400" />
                  {sidebarOpen && (
                    <div className="flex items-center justify-between w-full">
                      <span>Patient Queue</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800 font-bold">
                        {patients.length}
                      </span>
                    </div>
                  )}
                </button>
                {!sidebarOpen && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-slate-900 border border-slate-700/90 text-slate-100 text-xs font-semibold rounded-xl shadow-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 whitespace-nowrap flex items-center space-x-1.5">
                    <Users className="w-3.5 h-3.5 text-teal-400" />
                    <span>Patient Queue ({patients.length} Waiting)</span>
                  </div>
                )}
              </div>

              <div className="relative group">
                <button
                  onClick={() => setActiveTab('scans')}
                  title="AI DermScan Verification"
                  className={`w-full py-2 px-3 rounded-xl text-xs font-medium flex items-center ${
                    sidebarOpen ? 'justify-start space-x-3' : 'justify-center'
                  } transition-all ${
                    activeTab === 'scans' ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <Scan className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                  {sidebarOpen && (
                    <div className="flex items-center justify-between w-full">
                      <span>AI DermScan Verification</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold animate-pulse">
                        {aiScans.filter(s => s.status.includes('Pending')).length + autoReportCount}
                      </span>
                    </div>
                  )}
                </button>
                {!sidebarOpen && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-slate-900 border border-slate-700/90 text-slate-100 text-xs font-semibold rounded-xl shadow-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 whitespace-nowrap flex items-center space-x-1.5">
                    <Scan className="w-3.5 h-3.5 text-emerald-400" />
                    <span>AI DermScan Verification ({aiScans.filter(s => s.status.includes('Pending')).length} Pending)</span>
                  </div>
                )}
              </div>

              <div className="relative group">
                <button
                  onClick={() => setActiveTab('prescriptions')}
                  title="E-Prescription Desk"
                  className={`w-full py-2 px-3 rounded-xl text-xs font-medium flex items-center ${
                    sidebarOpen ? 'justify-start space-x-3' : 'justify-center'
                  } transition-all ${
                    activeTab === 'prescriptions' ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-4 h-4 flex-shrink-0 text-amber-400" />
                  {sidebarOpen && (
                    <div className="flex items-center justify-between w-full">
                      <span>E-Prescription Desk</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                        Rx
                      </span>
                    </div>
                  )}
                </button>
                {!sidebarOpen && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-slate-900 border border-slate-700/90 text-slate-100 text-xs font-semibold rounded-xl shadow-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 whitespace-nowrap flex items-center space-x-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    <span>E-Prescription Desk</span>
                  </div>
                )}
              </div>



            </div>

            {/* Scope Badge */}
            {sidebarOpen && (
              <div className="mx-3 my-2 p-2.5 bg-slate-950 border border-indigo-900/50 rounded-xl text-[10px] space-y-1">
                <span className="text-indigo-400 font-bold flex items-center">
                  <ShieldCheck className="w-3 h-3 mr-1 text-indigo-400" /> PCP Gatekeeper Scope
                </span>
                <p className="text-slate-400 text-[9.5px]">Authorized for facial skin & scalp prescriptions.</p>
              </div>
            )}
          </div>

          {/* Doctor User Footer Profile & Trigger */}
          <div className="p-3 border-t border-slate-800 bg-slate-950/80 relative group">
            <div
              onClick={() => setActiveTab('profile')}
              title="View Profile"
              className="flex items-center justify-between p-2 rounded-xl hover:bg-indigo-500/10 hover:border-indigo-500/30 cursor-pointer transition-all border border-slate-800/50"
            >
              <div className={`flex items-center ${sidebarOpen ? 'space-x-2.5' : 'justify-center w-full'}`}>
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold text-xs flex-shrink-0 shadow-md">
                  <Stethoscope className="w-4 h-4" />
                </div>
                {sidebarOpen && (
                  <div className="truncate text-left">
                    <p className="text-xs font-bold text-slate-100 truncate">{user.fullName}</p>
                    <p className="text-[10px] font-mono text-indigo-400 uppercase truncate">{user.specialization || 'Dermatology'} • View Profile</p>
                  </div>
                )}
              </div>
              {sidebarOpen && (
                <button
                  onClick={handleDoctorLogout}
                  title="Log Out of Doctor Portal"
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-all flex-shrink-0 ml-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
            {!sidebarOpen && (
              <div className="absolute left-full bottom-3 ml-3 px-2.5 py-1.5 bg-slate-900 border border-slate-700/90 text-slate-100 text-xs font-semibold rounded-xl shadow-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 whitespace-nowrap flex items-center space-x-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-indigo-400" />
                <span>View Profile ({user.fullName})</span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Top Doctor Header Bar */}
        <header className="h-14 border-b border-slate-800/80 bg-slate-900/90 px-6 flex items-center justify-between backdrop-blur-md relative z-50">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-semibold text-slate-400">Doctor Portal:</span>
            <span className="text-xs font-bold text-indigo-300 px-3 py-1 rounded-full bg-indigo-950 border border-indigo-800 flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Medical License: {user.licenseNumber || 'MCI-98421-B'}</span>
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Doctor Notifications Bell Dropdown */}
            <div className="relative z-50">
              <button
                onClick={() => setDoctorNotificationsOpen(!doctorNotificationsOpen)}
                className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 border border-slate-700 transition-all shadow-md"
              >
                <Bell className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Notifications</span>
                {sessionRequests.filter(r => r.status === 'REQUESTED').length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {sessionRequests.filter(r => r.status === 'REQUESTED').length}
                  </span>
                )}
              </button>

              {/* Backdrop Listener to click outside notification */}
              {doctorNotificationsOpen && (
                <div
                  className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-[1px]"
                  onClick={() => setDoctorNotificationsOpen(false)}
                />
              )}

              {doctorNotificationsOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl p-4 z-[100] space-y-3 shadow-slate-950/90 ring-1 ring-indigo-500/30 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h4 className="text-xs font-bold text-white flex items-center space-x-2">
                      <Bell className="w-3.5 h-3.5 text-amber-400" />
                      <span>Doctor Notifications & Incoming Requests</span>
                    </h4>
                    <button onClick={() => setDoctorNotificationsOpen(false)} className="text-slate-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {sessionRequests.length === 0 ? (
                    <div className="text-center py-4 text-xs text-slate-400">
                      No incoming session requests right now.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                      {sessionRequests.map((req) => (
                        <div key={req.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-amber-400 text-[11px]">📩 24-Hr Assessment Request</span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                              req.status === 'ACCEPTED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                            }`}>
                              {req.status === 'ACCEPTED' ? '🟢 ACCEPTED' : '⏳ PENDING'}
                            </span>
                          </div>
                          <p className="text-white text-[11px] font-semibold">Patient: Aarav Sharma</p>
                          <p className="text-slate-300 text-[11px]">Scope: <strong className="text-teal-300">{req.skinType}</strong></p>
                          <p className="text-slate-400 text-[10px]">Complaint: {req.chiefComplaint}</p>
                          
                          {req.status === 'REQUESTED' ? (
                            <button
                              onClick={() => handleDoctorAcceptSession(req.id)}
                              className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg shadow flex items-center justify-center space-x-1.5 transition-all"
                            >
                              <Video className="w-3.5 h-3.5" />
                              <span>Accept & Start Meet 🟢📹</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setDoctorNotificationsOpen(false);
                                setActiveTab('doctor-chat');
                              }}
                              className="w-full py-1.5 bg-indigo-600/30 border border-indigo-500/40 text-indigo-200 font-bold text-xs rounded-lg flex items-center justify-center space-x-1.5"
                            >
                              <Video className="w-3.5 h-3.5 text-indigo-400" />
                              <span>Open Live Tele-Chatroom 💬</span>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2 px-3 py-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <Clock className="w-3.5 h-3.5 text-teal-400" />
              <span className="text-slate-300 font-mono">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            </div>

            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">256-bit Encrypted Tele-Health</span>
            </div>
          </div>
        </header>

        {/* FULL WEBPAGE INDIVIDUAL PATIENT PROFILE VIEW */}
        {selectedPatientProfile ? (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 w-full">
            <IndividualPatientProfileView
              patient={selectedPatientProfile}
              prescriptions={prescriptions}
              sessionRequests={sessionRequests}
              onBack={() => setSelectedPatientProfile(null)}
              onStartVideo={(pt) => {
                setSelectedPatientProfile(null);
                setActiveConsultationPatient(pt);
              }}
              onIssueRx={(pt) => {
                setSelectedPatientProfile(null);
                setPrescriptionModalPatient(pt);
              }}
              onUnlockProduct={handleDoctorUnlockProduct}
            />
          </div>
        ) : (
          <>
        {/* TAB 1: OVERVIEW COMMAND CENTER */}
        {activeTab === 'overview' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 max-w-6xl mx-auto space-y-6 w-full">

            {/* Doctor Welcome Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-900/50 p-6 shadow-2xl space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>DermAura SIH Tele-Dermatology Platform</span>
                  </div>
                  <h2 className="text-2xl font-black text-white">
                    Welcome back, <span className="text-indigo-400">{user.fullName}</span>
                  </h2>
                  <p className="text-xs text-slate-300 mt-1 max-w-xl">
                    You have <strong className="text-teal-300">{patients.filter(p => p.status.includes('Waiting')).length} patients</strong> waiting in your tele-consultation queue and <strong className="text-emerald-300">{aiScans.filter(s => s.status.includes('Pending')).length} AI DermScans</strong> awaiting signature.
                  </p>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => setActiveTab('queue')}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center space-x-2 transition-all"
                  >
                    <Video className="w-4 h-4" />
                    <span>Start Tele-Consult Queue</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2 shadow-lg">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Today's Appointments</span>
                  <Users className="w-4 h-4 text-teal-400" />
                </div>
                <div className="text-2xl font-black text-white">{patients.length}</div>
                <span className="text-[10px] text-teal-400 font-semibold">4 Tele-Consults Scheduled</span>
              </div>

              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2 shadow-lg">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Pending AI DermScans</span>
                  <Scan className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-emerald-400">
                  {aiScans.filter(s => s.status.includes('Pending')).length}
                </div>
                <span className="text-[10px] text-emerald-400 font-semibold">Awaiting Doctor Sign-off</span>
              </div>

              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2 shadow-lg">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>E-Prescriptions Issued</span>
                  <FileText className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-black text-amber-400">{prescriptions.length}</div>
                <span className="text-[10px] text-amber-400 font-semibold">Pharmacy Checkout Unlocked</span>
              </div>

              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2 shadow-lg">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Clinical Rating</span>
                  <Award className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-black text-purple-400">4.9 / 5.0</div>
                <span className="text-[10px] text-purple-400 font-semibold">140+ Patient Reviews</span>
              </div>
            </div>

            {/* Main Interactive Queue & DermScan Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Live Patient Queue */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <Users className="w-4 h-4 text-teal-400" />
                    <span>Live Patient Consultation Queue</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('queue')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    View All ({patients.length}) →
                  </button>
                </div>

                <div className="space-y-3">
                  {patients.map((pt) => (
                    <div
                      key={pt.id}
                      className="p-4 bg-slate-900 border border-slate-800 hover:border-indigo-500/40 rounded-2xl space-y-3 transition-all shadow-md"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-xl">
                            {pt.photo}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="text-sm font-bold text-white">{pt.name}</h4>
                              <span className="text-[10px] text-slate-400">({pt.age} yrs • {pt.gender})</span>
                            </div>
                            <span className="text-[11px] text-indigo-300 font-medium block">{pt.concern}</span>
                          </div>
                        </div>

                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          pt.urgency === 'High' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-teal-950 text-teal-300 border border-teal-800'
                        }`}>
                          Urgency: {pt.urgency}
                        </span>
                      </div>

                      <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2 text-slate-400 text-[11px]">
                          <Bot className="w-3.5 h-3.5 text-teal-400" />
                          <span>AI Triage: <strong className="text-teal-300">{pt.aiTriage}</strong></span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">{pt.time}</span>
                      </div>

                      {/* Shared Stress Assessment Pill */}
                      {sharedStressReport && (sharedStressReport.patientName === pt.name || pt.name === 'Aarav Sharma') && (
                        <div className="p-2.5 bg-indigo-950/40 border border-indigo-800/60 rounded-xl space-y-1.5 text-xs text-indigo-300">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1.5 text-[11px]">
                              <Zap className="w-3.5 h-3.5 text-indigo-400" />
                              <span>Shared Stress Quiz: <strong>{sharedStressReport.percentage}% Impact</strong></span>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${sharedStressReport.badgeColor}`}>
                              {sharedStressReport.category}
                            </span>
                          </div>

                          <button
                            onClick={() => setShowFullStressModal(sharedStressReport)}
                            className="w-full py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 rounded-lg text-[11px] font-semibold text-indigo-200 transition-all flex items-center justify-center space-x-1"
                          >
                            <Eye className="w-3.5 h-3.5 text-indigo-300" />
                            <span>View Full Quiz & Patient Selected Options 📋</span>
                          </button>
                        </div>
                      )}

                      <div className="flex space-x-2 pt-1">
                        <button
                          onClick={() => setActiveConsultationPatient(pt)}
                          className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center space-x-1.5 transition-all"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Launch Video Consultation</span>
                        </button>
                        
                        <button
                          onClick={() => setPrescriptionModalPatient(pt)}
                          className="py-2 px-3 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 font-bold text-xs rounded-xl flex items-center space-x-1 transition-all"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Issue Rx</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: AI DermScan Sign-off Center */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <Scan className="w-4 h-4 text-emerald-400" />
                    <span>AI DermScan Sign-off Desk</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('scans')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    View All →
                  </button>
                </div>

                <div className="space-y-3">
                  {aiScans.map((scan) => (
                    <div
                      key={scan.id}
                      className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 shadow-md"
                    >
                      <div className="flex items-center space-x-3">
                        <img src={scan.image} alt="Scan Target" className="w-14 h-14 rounded-xl object-cover border border-slate-800" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-white">{scan.patientName}</h4>
                            <button
                              onClick={() => setAvoidModalScan(scan)}
                              className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center space-x-1 font-semibold"
                              title="Edit clinical advice (things for patient to avoid)"
                            >
                              <Pencil className="w-3 h-3" />
                              <span>Avoid Advice</span>
                            </button>
                          </div>
                          <span className="text-[11px] text-emerald-400 font-bold block">{scan.predictedCondition}</span>
                          <span className="text-[10px] text-slate-500 font-mono">AI Confidence: {scan.confidence}</span>
                        </div>
                      </div>

                      {/* Clinical Avoid Suggestions Display */}
                      {scan.avoidSuggestions && scan.avoidSuggestions.length > 0 && (
                        <div className="p-2 bg-amber-950/30 border border-amber-900/50 rounded-xl space-y-1 text-[11px]">
                          <span className="text-[10px] font-mono text-amber-400 uppercase font-bold flex items-center">
                            <ShieldAlert className="w-3 h-3 mr-1" />
                            <span>Patient Caution (Things to Avoid):</span>
                          </span>
                          <ul className="list-disc list-inside text-amber-200/90 space-y-0.5 text-[10px]">
                            {scan.avoidSuggestions.slice(0, 2).map((item, idx) => (
                              <li key={idx} className="truncate">{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
                        <span className={`text-[10px] font-mono font-bold ${
                          scan.status.includes('Pending') ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          {scan.status}
                        </span>

                        {scan.status.includes('Pending') ? (
                          <button
                            onClick={() => handleApproveScan(scan.id)}
                            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-all flex items-center space-x-1 shadow"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Verify & Sign-off</span>
                          </button>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-semibold text-emerald-400 flex items-center space-x-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Verified</span>
                            </span>
                            <button
                              onClick={() => handleUndoVerification(scan.id)}
                              className="px-2 py-1 bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-800 rounded-lg text-[10px] font-semibold transition-all flex items-center space-x-1"
                              title="Undo/revoke accidental verification"
                            >
                              <RotateCcw className="w-3 h-3 text-rose-400" />
                              <span>Undo</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 1.5: PATIENT TELE-CHATROOM */}
        {activeTab === 'doctor-chat' && (
          <HealthChatroom
            role="doctor"
            currentUser={user}
            initialPatientId={activeChatPatientId}
            doctorPatients={patients}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}

        {/* TAB 2: PATIENT QUEUE */}
        {activeTab === 'queue' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 max-w-5xl mx-auto space-y-6 w-full">
            <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <Users className="w-5 h-5 text-teal-400" />
                  <span>Patient Tele-Consultation Queue</span>
                </h2>
                <p className="text-xs text-slate-400">Manage waiting room patients, review pre-triage AI notes, and launch video sessions.</p>
              </div>

              <span className="px-3 py-1 rounded-full bg-teal-950 text-teal-300 border border-teal-800 text-xs font-mono font-bold">
                {patients.length} PATIENTS WAITING
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {patients.map((pt) => (
                <div key={pt.id} className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-2xl">
                        {pt.photo}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">{pt.name}</h3>
                        <p className="text-xs text-slate-400">{pt.age} Yrs • {pt.gender} • Blood Group: {pt.bloodGroup}</p>
                        <span className="text-[10px] text-rose-300 font-semibold block">Allergies: {pt.allergies.join(', ')}</span>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 bg-indigo-950 text-indigo-300 border border-indigo-800 rounded-full text-[10px] font-mono font-bold">
                      {pt.time}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1 text-xs">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Chief Concern & Anatomic Region</span>
                    <p className="font-bold text-teal-300">{pt.concern}</p>
                    <p className="text-[11px] text-slate-400">Affected Area: {pt.anatomicRegion}</p>
                  </div>

                  <div className="p-3 bg-indigo-950/30 rounded-2xl border border-indigo-900/50 space-y-1 text-xs">
                    <span className="text-[10px] font-mono text-indigo-400 uppercase block flex items-center">
                      <Bot className="w-3 h-3 mr-1" /> DermAura AI Triage Match:
                    </span>
                    <p className="font-semibold text-slate-200">{pt.aiTriage}</p>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <button
                      onClick={() => setSelectedPatientProfile(pt)}
                      className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl flex items-center space-x-1 transition-all"
                      title="View Dedicated Full Webpage Profile for this Patient"
                    >
                      <User className="w-4 h-4 text-indigo-400" />
                      <span>Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveChatPatientId(pt.id);
                        setActiveTab('doctor-chat');
                      }}
                      className="py-2.5 px-3 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-800 font-bold text-xs rounded-xl flex items-center space-x-1 transition-all"
                      title="Open Dedicated Chatroom with this Patient"
                    >
                      <MessageSquare className="w-4 h-4 text-indigo-400" />
                      <span>Chat</span>
                    </button>
                    <button
                      onClick={() => setActiveConsultationPatient(pt)}
                      className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center space-x-1.5 transition-all"
                    >
                      <Video className="w-4 h-4" />
                      <span>Start Video</span>
                    </button>
                    <button
                      onClick={() => setPrescriptionModalPatient(pt)}
                      className="py-2.5 px-3 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 font-bold text-xs rounded-xl flex items-center space-x-1 transition-all"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Issue Rx</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: AI SCANS VERIFICATION (FULL CLINICAL REPORT VIEW) */}
        {activeTab === 'scans' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 max-w-5xl mx-auto space-y-6 w-full">
            <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <Scan className="w-5 h-5 text-emerald-400" />
                  <span>AI DermScan Clinical Verification Desk</span>
                </h2>
                <p className="text-xs text-slate-400">Review full unabridged AI neural network clinical reports, confirm diagnoses, edit advisories, and issue official sign-offs.</p>
              </div>

              <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-mono font-bold">
                {aiScans.length} FULL REPORTS READY
              </span>
            </div>

            {/* FULL CLINICAL REPORT CARDS LIST */}
            <div className="space-y-6">
              {aiScans.map((scan) => {
                const targetPt = patients.find(p => p.name.toLowerCase() === scan.patientName.toLowerCase()) || patients[0];

                return (
                  <div key={scan.id} className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-5 shadow-2xl relative overflow-hidden">
                    {/* Report Header Bar */}
                    <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4 gap-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-2xl bg-teal-950/80 border border-teal-800 flex items-center justify-center text-teal-300 font-bold">
                          <Brain className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-base font-bold text-white">{scan.patientName}</h3>
                            <span className="px-2.5 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800 font-mono text-[10px] font-bold">
                              {scan.confidence || '95.4%'} Neural Match
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 font-mono">
                            Report ID: #{scan.id} • Submitted: {scan.scanDate} • Attending Lead PCP: {user.fullName || 'Dr. Sarah Jenkins'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setAvoidModalScan(scan)}
                          className="px-3 py-1.5 bg-amber-950/70 hover:bg-amber-900 border border-amber-800/80 text-amber-300 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all shadow"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Edit Patient Advisory</span>
                        </button>

                        <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
                          scan.status.includes('Pending')
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}>
                          {scan.status}
                        </span>
                      </div>
                    </div>

                    {/* Report Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* LEFT COLUMN: Visual Scan Image & Marker Detection */}
                      <div className="space-y-4">
                        <div className="relative h-56 w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner group">
                          <img src={scan.image} alt="DermScan Target" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex items-end p-3">
                            <span className="text-[11px] font-mono text-teal-300 font-bold bg-slate-950/90 px-2.5 py-1 rounded-lg border border-teal-800/80">
                              Target Region: {scan.anatomicRegion || 'Malar Cheeks & T-Zone'}
                            </span>
                          </div>
                        </div>

                        {/* Visual Lesion Markers Detected */}
                        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
                          <span className="text-[10px] font-mono text-teal-400 font-bold uppercase block flex items-center">
                            <Activity className="w-3.5 h-3.5 mr-1" />
                            <span>Visual Lesion Markers Detected:</span>
                          </span>
                          <ul className="space-y-1.5 text-slate-300">
                            {(scan.visualMarkers || [
                              '8-12 Inflammatory Papules in Malar cheek area',
                              'Dense Micro-Comedones across nasal bridge & T-Zone',
                              'Mild Post-Inflammatory Hyperpigmentation (PIH)'
                            ]).map((marker, idx) => (
                              <li key={idx} className="flex items-start space-x-2 text-[11px]">
                                <span className="text-teal-400 font-bold">•</span>
                                <span>{marker}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* RIGHT COLUMN (SPANS 2 COLS): Diagnostic Assessment, Sebum, Cortisol & Regimen */}
                      <div className="lg:col-span-2 space-y-4">
                        
                        {/* Primary Diagnostic Assessment Box */}
                        <div className="p-4 bg-slate-950 rounded-2xl border border-emerald-900/40 space-y-2 text-xs">
                          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">AI Diagnostic Classification & Severity</span>
                          <div className="flex items-center justify-between">
                            <h4 className="text-base font-bold text-emerald-400">{scan.predictedCondition}</h4>
                            <span className="px-2.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-mono text-[10px] font-bold">
                              Severity: {scan.severity}
                            </span>
                          </div>
                        </div>

                        {/* Sebum Output & Cortisol Stress Correlation */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                            <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold">Sebum Production Output</span>
                            <p className="font-bold text-amber-300">{scan.sebumIndex || '7.8 / 10 (Elevated Sebum Output)'}</p>
                          </div>
                          <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                            <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold flex items-center">
                              <HeartPulse className="w-3.5 h-3.5 text-rose-400 mr-1" />
                              <span>Cortisol Stress Flare Risk</span>
                            </span>
                            <p className="font-bold text-rose-300">{scan.cortisolRisk || 'High Neuro-Skin Flare Risk (75% Index)'}</p>
                          </div>
                        </div>

                        {/* STRESS ANALYZER QUIZ SOFT REPORT BANNER */}
                        {sharedStressReport && (
                          <div className="p-4 bg-indigo-950/40 border border-indigo-800/60 rounded-2xl space-y-2 text-xs shadow-inner">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono text-indigo-300 font-bold uppercase flex items-center">
                                <Brain className="w-3.5 h-3.5 text-indigo-400 mr-1" />
                                <span>Patient Stress Analyzer Quiz Soft Report:</span>
                              </span>
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${sharedStressReport.badgeColor}`}>
                                {sharedStressReport.category}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center justify-between text-slate-200 gap-2">
                              <div>
                                <span className="text-[11px] text-slate-400">Cortisol Impact: </span>
                                <strong className="text-white text-xs">{sharedStressReport.score}/{sharedStressReport.maxPts} ({sharedStressReport.percentage}%)</strong>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => setShowFullStressModal(sharedStressReport)}
                                  className="px-2.5 py-1 bg-indigo-900/80 hover:bg-indigo-800 text-indigo-200 border border-indigo-700 text-[10px] font-bold rounded-lg transition-all flex items-center space-x-1"
                                >
                                  <FileText className="w-3 h-3 text-indigo-300" />
                                  <span>View Soft Report</span>
                                </button>
                                <button
                                  onClick={() => handleDownloadReportPDF(scan, sharedStressReport, targetPt)}
                                  className="px-2.5 py-1 bg-teal-950 hover:bg-teal-900 text-teal-300 border border-teal-800 text-[10px] font-bold rounded-lg transition-all flex items-center space-x-1"
                                >
                                  <Download className="w-3 h-3 text-teal-400" />
                                  <span>PDF</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* AI Recommended Care Regimen */}
                        <div className="p-4 bg-indigo-950/30 rounded-2xl border border-indigo-900/50 space-y-1 text-xs">
                          <span className="text-[10px] font-mono text-indigo-300 font-bold uppercase block flex items-center">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-400 mr-1" />
                            <span>Recommended AI Clinical Regimen Care:</span>
                          </span>
                          <p className="text-slate-200 font-semibold text-xs leading-relaxed">
                            {scan.aiRecommendation || 'Nighttime Topical Retinoid (Tretinoin 0.05%) + Gentle Non-Comedogenic Hydrating Cleanser'}
                          </p>
                        </div>

                        {/* Patient Advisory Box (Things to Avoid) */}
                        {scan.avoidSuggestions && scan.avoidSuggestions.length > 0 && (
                          <div className="p-4 bg-amber-950/30 border border-amber-900/50 rounded-2xl space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono text-amber-400 uppercase font-bold flex items-center">
                                <ShieldAlert className="w-4 h-4 text-amber-400 mr-1" />
                                <span>Patient Advisory (Things to Avoid Instructions):</span>
                              </span>
                              <span className="text-[10px] text-amber-300 font-mono font-bold">Doctor Editable</span>
                            </div>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-amber-200/90">
                              {scan.avoidSuggestions.map((item, idx) => (
                                <li key={idx} className="flex items-start space-x-1.5">
                                  <span className="text-amber-400 font-bold">•</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Report Footer Doctor Action Bar */}
                    <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedPatientProfile(targetPt)}
                          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all"
                        >
                          <User className="w-3.5 h-3.5 text-indigo-400" />
                          <span>View Full Profile</span>
                        </button>

                        <button
                          onClick={() => setActiveConsultationPatient(targetPt)}
                          className="px-3.5 py-2 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-800 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all"
                        >
                          <Video className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Launch Video Consult</span>
                        </button>

                        <button
                          onClick={() => handleDownloadReportPDF(scan, sharedStressReport, targetPt)}
                          className="px-3.5 py-2 bg-teal-950 hover:bg-teal-900 text-teal-300 border border-teal-800 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all shadow"
                          title="Download/Print Official PDF Clinical Assessment Report"
                        >
                          <Download className="w-3.5 h-3.5 text-teal-400" />
                          <span>Download PDF Report</span>
                        </button>

                        <button
                          onClick={() => setPrescriptionModalPatient(targetPt)}
                          className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow flex items-center space-x-1.5 transition-all"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Issue E-Prescription</span>
                        </button>
                      </div>

                      <div className="flex items-center space-x-2">
                        {scan.status.includes('Pending') ? (
                          <button
                            onClick={() => handleApproveScan(scan.id)}
                            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/25 flex items-center space-x-2 transition-all"
                          >
                            <Check className="w-4 h-4" />
                            <span>Verify & Sign-off AI Clinical Report</span>
                          </button>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <div className="px-4 py-2 bg-emerald-950 border border-emerald-800 text-emerald-300 rounded-xl text-xs font-bold flex items-center space-x-1.5">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Official Doctor Sign-off Attached</span>
                            </div>
                            <button
                              onClick={() => handleUndoVerification(scan.id)}
                              className="px-3 py-2 bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-800 rounded-xl text-xs font-bold transition-all flex items-center space-x-1"
                              title="Undo/revoke accidental sign-off"
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                              <span>Undo Sign-off</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: PRESCRIPTIONS DESK */}
        {activeTab === 'prescriptions' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 max-w-5xl mx-auto space-y-6 w-full">
            <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-amber-400" />
                  <span>Digital E-Prescription Desk</span>
                </h2>
                <p className="text-xs text-slate-400">Issued prescriptions automatically unlock gated medical treatments in DermPharmacy for patients.</p>
              </div>

              <button
                onClick={() => setPrescriptionModalPatient(patients[0])}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center space-x-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create New E-Prescription</span>
              </button>
            </div>

            <div className="space-y-4">
              {prescriptions.map((rx) => (
                <div key={rx.id} className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-6 h-6 text-amber-400" />
                      <div>
                        <h3 className="text-base font-bold text-white">{rx.patientName}</h3>
                        <span className="text-[10px] text-slate-400 font-mono">Issued {rx.date} • License: {user.licenseNumber || 'MCI-98421-B'}</span>
                      </div>
                    </div>

                    <span className="px-3 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full text-xs font-mono font-bold">
                      {rx.status}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-mono text-slate-500 uppercase block">Prescribed Medicines:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {rx.medicines.map((med, i) => (
                        <div key={i} className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                          <p className="font-bold text-teal-300">{med.name}</p>
                          <span className="text-[11px] text-slate-400 block">{med.dosage} ({med.duration})</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {rx.notes && (
                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs space-y-1">
                      <span className="text-[10px] font-mono text-amber-400 uppercase block">Doctor Instructions & Safety Warnings:</span>
                      <p className="text-slate-300">{rx.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* INCOMING UNLOCK REQUESTS FROM PATIENT CHAT */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-amber-400" />
                  <span>Incoming Patient Rx Product Unlock Requests ({unlockRequests.length})</span>
                </h3>
                <span className="text-xs text-amber-400 font-mono">Real-time Tele-Chat Sync</span>
              </div>

              {unlockRequests.length === 0 ? (
                <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center text-slate-500 text-xs">
                  No pending unlock requests from patients.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {unlockRequests.map((req) => {
                    const isAlreadyUnlocked = unlockedProducts.includes(req.productId);

                    return (
                      <div key={req.id} className="p-5 bg-slate-900 border border-amber-900/50 rounded-3xl space-y-3 shadow-xl flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2.5">
                              <span className="text-2xl">{req.productImage || '💊'}</span>
                              <div>
                                <h4 className="text-sm font-bold text-white">{req.patientName}</h4>
                                <span className="text-[10px] text-slate-400 font-mono">Sent at {req.timestamp}</span>
                              </div>
                            </div>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                              isAlreadyUnlocked || req.status.includes('UNLOCKED')
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : 'bg-amber-950 text-amber-300 border border-amber-800'
                            }`}>
                              {isAlreadyUnlocked ? 'UNLOCKED 🔓' : req.status}
                            </span>
                          </div>

                          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-slate-200">{req.productName}</span>
                              <span className="font-mono text-emerald-400 font-bold">₹{req.productPrice}</span>
                            </div>
                            <p className="text-[11px] text-slate-300 italic pt-1 border-t border-slate-800/80">"{req.message}"</p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 font-semibold">Doctor Verification Action:</span>
                          {isAlreadyUnlocked ? (
                            <button
                              onClick={() => handleDoctorLockProduct(req.productId)}
                              className="px-3.5 py-1.5 bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-800 text-xs font-bold rounded-xl transition-all flex items-center space-x-1"
                            >
                              <Lock className="w-3.5 h-3.5 text-rose-400" />
                              <span>Re-Lock Item</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                const prod = doctorPharmacyProducts.find(p => p.id === req.productId) || { id: req.productId, name: req.productName, price: req.productPrice, image: req.productImage || '💊', category: 'Prescription Medicine' };
                                handleOpenUnlockModal(prod, req.id, req.patientName);
                              }}
                              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-1.5"
                            >
                              <Unlock className="w-4 h-4" />
                              <span>🔓 Select Patient & Unlock</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* DOCTOR PHARMACY PRODUCT ROSTER & UNLOCK CONTROL DESK */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <ShieldCheck className="w-5 h-5 text-teal-400" />
                    <span>DermPharmacy Doctor Product Unlock Control Desk</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Patients can only buy <strong>Organic</strong> products by default. Control prescription & clinical product unlock status for patient Aarav Sharma.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {doctorPharmacyProducts.map((prod) => {
                  const isUnlocked = unlockedProducts.includes(prod.id);
                  const isOrganic = prod.isOrganic;

                  return (
                    <div
                      key={prod.id}
                      className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 flex flex-col justify-between shadow-lg"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl">{prod.image}</span>
                          {isOrganic ? (
                            <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-mono font-bold rounded-full">
                              Organic 🌿
                            </span>
                          ) : isUnlocked ? (
                            <span className="px-2 py-0.5 bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] font-mono font-bold rounded-full">
                              Unlocked 🔓
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-mono font-bold rounded-full">
                              Locked 🔒
                            </span>
                          )}
                        </div>

                        <div>
                          <span className="text-[10px] font-mono text-slate-500 uppercase block">{prod.category}</span>
                          <h4 className="text-xs font-bold text-white line-clamp-1">{prod.name}</h4>
                          <span className="text-xs font-mono font-bold text-emerald-400 block mt-0.5">₹{prod.price}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800">
                        {isOrganic ? (
                          <div className="py-1.5 bg-slate-950 rounded-xl text-center text-[10px] text-emerald-400 font-mono font-bold border border-slate-800">
                            Direct Patient Purchase Allowed
                          </div>
                        ) : isUnlocked ? (
                          <button
                            onClick={() => handleDoctorLockProduct(prod.id)}
                            className="w-full py-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-bold forested rounded-xl transition-all flex items-center justify-center space-x-1"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            <span>Revoke / Lock Item</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenUnlockModal(prod)}
                            className="w-full py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-1"
                          >
                            <Unlock className="w-3.5 h-3.5" />
                            <span>🔓 Select Patient & Unlock</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}



        {/* TAB 6: DOCTOR PROFILE & CREDENTIALS WEBPAGE */}
        {activeTab === 'profile' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 w-full">
            <DoctorProfilePage
              user={user}
              onUpdateUser={(updated) => console.log('Updated doctor profile:', updated)}
              onLogout={onLogout}
              sessionRequests={sessionRequests}
              unlockRequests={unlockRequests}
              aiScans={aiScans}
              onAcceptSession={handleDoctorAcceptSession}
              onUnlockProduct={handleDoctorUnlockProduct}
              onLockProduct={handleDoctorLockProduct}
              onApproveScan={handleApproveScan}
            />
          </div>
        )}
        </>
        )}

      </main>

      {/* MODAL 1: LIVE VIDEO CONSULTATION MODAL */}
      {activeConsultationPatient && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-2xl shadow-2xl space-y-4 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Video className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Live Tele-Consultation with {activeConsultationPatient.name}</h3>
              </div>
              <button
                onClick={() => setActiveConsultationPatient(null)}
                className="p-1 text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Simulation Box */}
            <div className="relative h-64 w-full bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="w-20 h-20 rounded-full bg-indigo-600/20 border-2 border-indigo-500 flex items-center justify-center text-4xl mx-auto animate-pulse">
                  {activeConsultationPatient.photo}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{activeConsultationPatient.name} (Connected)</h4>
                  <span className="text-xs text-teal-400 font-mono">HD Encrypted Stream Active • 00:03:12</span>
                </div>
              </div>

              {/* Doctor PIP preview */}
              <div className="absolute bottom-3 right-3 w-28 h-20 bg-slate-900 border border-slate-700 rounded-xl overflow-hidden p-2 text-center flex flex-col items-center justify-center text-[10px]">
                <Stethoscope className="w-5 h-5 text-indigo-400 mb-1" />
                <span className="text-slate-300 font-bold truncate w-full">{user.fullName}</span>
              </div>
            </div>

            {/* Shared Patient Stress Assessment Box */}
            {sharedStressReport && (sharedStressReport.patientName === activeConsultationPatient.name || activeConsultationPatient.name === 'Aarav Sharma') && (
              <div className="p-3.5 bg-indigo-950/40 border border-indigo-800/60 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-indigo-300 uppercase font-bold flex items-center">
                    <Zap className="w-3.5 h-3.5 text-indigo-400 mr-1" />
                    Patient Shared Stress & Cortisol Level ({sharedStressReport.percentage}%)
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${sharedStressReport.badgeColor}`}>
                    {sharedStressReport.category}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">{sharedStressReport.summary}</p>
                <button
                  onClick={() => setShowFullStressModal(sharedStressReport)}
                  className="w-full py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 rounded-xl text-xs font-semibold text-indigo-200 transition-all flex items-center justify-center space-x-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-indigo-300" />
                  <span>View All Selected Quiz Options & Full Detailed Report 📋</span>
                </button>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    const pt = activeConsultationPatient;
                    setActiveConsultationPatient(null);
                    setPrescriptionModalPatient(pt);
                  }}
                  className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center space-x-1.5 transition-all"
                >
                  <FileText className="w-4 h-4" />
                  <span>Write E-Prescription Now</span>
                </button>
              </div>

              <button
                onClick={() => setActiveConsultationPatient(null)}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
              >
                End Call
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: E-PRESCRIPTION BUILDER MODAL */}
      {prescriptionModalPatient && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Digital E-Prescription for {prescriptionModalPatient.name}</h3>
              </div>
              <button
                onClick={() => setPrescriptionModalPatient(null)}
                className="p-1 text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* PATIENT SELECTION DROPDOWN */}
            <div className="space-y-2.5 p-3.5 bg-slate-950 rounded-2xl border border-indigo-500/40">
              <label className="block text-xs font-bold text-white flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-teal-400" />
                  <span>Select Target Patient for Prescription *</span>
                </div>
                <span className="text-[10px] text-teal-400 font-mono font-bold">Active Patient List</span>
              </label>

              <select
                value={prescriptionModalPatient.id}
                onChange={(e) => {
                  const selectedPt = patients.find(p => p.id === e.target.value);
                  if (selectedPt) setPrescriptionModalPatient(selectedPt);
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-semibold focus:outline-none focus:border-teal-500 transition-all shadow-inner"
              >
                {patients.map((pt) => (
                  <option key={pt.id} value={pt.id}>
                    {pt.photo} {pt.name} ({pt.age} Yrs, {pt.gender}) — {pt.concern}
                  </option>
                ))}
              </select>

              <div className="pt-2 text-xs space-y-1 border-t border-slate-800/80 mt-1">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Patient: <strong className="text-white">{prescriptionModalPatient.name}</strong> ({prescriptionModalPatient.age} Yrs, {prescriptionModalPatient.gender})</span>
                  <span className="text-[10px] font-mono text-slate-400">Blood: {prescriptionModalPatient.bloodGroup || 'O+'}</span>
                </div>
                <p className="text-teal-300 font-semibold text-[11px]">Primary Diagnosis: {prescriptionModalPatient.concern}</p>
                {prescriptionModalPatient.allergies && prescriptionModalPatient.allergies.length > 0 && (
                  <p className="text-rose-400 text-[10px] flex items-center space-x-1">
                    <span>⚠️ Known Clinical Allergies:</span>
                    <strong className="font-mono text-rose-300">{Array.isArray(prescriptionModalPatient.allergies) ? prescriptionModalPatient.allergies.join(', ') : prescriptionModalPatient.allergies}</strong>
                  </p>
                )}
              </div>
            </div>

            {/* Medicine Selector */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Select DermAura Pharmacy Treatment Medicine *</label>
                <select
                  value={newRxMedicine}
                  onChange={(e) => setNewRxMedicine(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Tretinoin 0.05% Facial Acne & Retinoid Gel">Tretinoin 0.05% Facial Acne Gel (Prescription)</option>
                  <option value="Hydrocortisone 1% Facial Dermatitis Cream">Hydrocortisone 1% Facial Cream (Prescription)</option>
                  <option value="Minoxidil 5% Hair & Scalp Regrowth Solution">Minoxidil 5% Hair Regrowth Solution (Prescription)</option>
                  <option value="Ketoconazole 2% Scalp Anti-Dandruff Solution">Ketoconazole 2% Scalp Solution (Prescription)</option>
                  <option value="DermAura Hydrating Gentle Facial Moisturizer">DermAura Hydrating Facial Moisturizer (OTC Care)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Dosage Instructions *</label>
                  <input
                    type="text"
                    value={newRxDosage}
                    onChange={(e) => setNewRxDosage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Duration *</label>
                  <input
                    type="text"
                    value={newRxDuration}
                    onChange={(e) => setNewRxDuration(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Doctor Clinical Instructions & Warnings</label>
                <textarea
                  rows={2}
                  value={newRxNotes}
                  onChange={(e) => setNewRxNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="p-3 bg-emerald-950/40 border border-emerald-800/50 rounded-2xl text-[11px] text-emerald-300 font-medium">
                ⚡ Signing this prescription will instantly unlock this patient's ability to order prescribed items in DermPharmacy.
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setPrescriptionModalPatient(null)}
                className="w-1/3 py-2.5 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleIssuePrescription}
                className="w-2/3 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/25 flex items-center justify-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Sign & Issue E-Prescription</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Patient Avoid Advice Editor Modal */}
      {avoidModalScan && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Patient Advisory (Things to Avoid)</h3>
              </div>
              <button
                onClick={() => setAvoidModalScan(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-300">Patient: {avoidModalScan.patientName}</span>
              <p className="text-xs text-emerald-400 font-mono font-bold">Condition: {avoidModalScan.predictedCondition}</p>
              <p className="text-[11px] text-slate-400">Suggest clinical practices or triggers for this patient to avoid to prevent disease exacerbation.</p>
            </div>

            {/* Existing Items List */}
            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar p-1">
              <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Active Patient Cautions:</span>
              {(avoidModalScan.avoidSuggestions || []).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                  <span className="text-amber-200/90 font-medium">{item}</span>
                  <button
                    onClick={() => handleRemoveAvoidItem(index)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Item Input */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold">Add New Caution Suggestion:</span>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newAvoidItemInput}
                  onChange={(e) => setNewAvoidItemInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddAvoidItem()}
                  placeholder="e.g., Avoid hot water scalp washes..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={handleAddAvoidItem}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center space-x-1 shadow"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setAvoidModalScan(null)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow"
              >
                Save & Close Advisory
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: FULL PATIENT QUIZ & STRESS REPORT MODAL */}
      {showFullStressModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-2xl shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-base font-bold text-white">
                    Neuro-Skin Stress & Cortisol Clinical Report
                  </h3>
                  <p className="text-xs text-slate-400">
                    Patient: <strong className="text-indigo-300">{showFullStressModal.patientName}</strong> ({showFullStressModal.patientEmail})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFullStressModal(null)}
                className="p-1 text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Overview Score Dial & Risk Category */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center space-y-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Impact Score</span>
                <div className="text-3xl font-black text-indigo-400">{showFullStressModal.percentage}%</div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {showFullStressModal.score} / {showFullStressModal.maxPts || 20} Impact Points
                </span>
              </div>

              <div className="md:col-span-2 p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold">Clinical Impact Summary</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${showFullStressModal.badgeColor}`}>
                    {showFullStressModal.category}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{showFullStressModal.summary}</p>
              </div>
            </div>

            {/* Itemized Patient Quiz Options */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Patient Selected Quiz Options ({showFullStressModal.detailedAnswers?.length || 5} Questions)</span>
                </h4>
                <span className="text-[10px] text-slate-500 font-mono">Shared: {showFullStressModal.sharedAt || 'Today'}</span>
              </div>

              <div className="space-y-2.5">
                {(showFullStressModal.detailedAnswers || defaultStressReport.detailedAnswers).map((item, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-slate-200">{item.question}</span>
                      <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] font-mono font-bold flex-shrink-0">
                        +{item.pts} Pts
                      </span>
                    </div>
                    <div className="p-2.5 bg-slate-900/90 rounded-xl border border-indigo-900/40 flex items-center space-x-2 text-xs text-indigo-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                      <span>Selected Option: <strong className="text-white">{item.selectedOption}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Care Steps */}
            {showFullStressModal.recommendations && (
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold flex items-center">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                  Recommended Care Guidance:
                </span>
                <ul className="space-y-1 text-slate-300">
                  {showFullStressModal.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="text-teal-400">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-3 border-t border-slate-800 flex flex-wrap justify-between items-center gap-2">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const pt = patients.find(p => p.name === showFullStressModal.patientName) || patients[0];
                    setShowFullStressModal(null);
                    setPrescriptionModalPatient(pt);
                  }}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center space-x-1.5 transition-all"
                >
                  <FileText className="w-4 h-4" />
                  <span>Incorporate into E-Prescription</span>
                </button>

                <button
                  onClick={() => handleDownloadReportPDF(null, showFullStressModal, patients.find(p => p.name === showFullStressModal.patientName) || patients[0])}
                  className="px-4 py-2.5 bg-teal-950 hover:bg-teal-900 text-teal-300 border border-teal-800 font-bold text-xs rounded-xl transition-all flex items-center space-x-1.5"
                >
                  <Download className="w-4 h-4 text-teal-400" />
                  <span>Download PDF Report</span>
                </button>
              </div>

              <button
                onClick={() => setShowFullStressModal(null)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PATIENT SELECTION UNLOCK MODAL */}
      {unlockModalState && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl ring-1 ring-emerald-500/30">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-xl">
                  🔓
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Unlock Prescription Medicine</h3>
                  <span className="text-[11px] text-emerald-400 font-mono">DermPharmacy Clinical Authorization</span>
                </div>
              </div>
              <button
                onClick={() => setUnlockModalState(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target Product Summary Card */}
            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex items-center space-x-3">
              <span className="text-3xl">{unlockModalState.prod.image || '💊'}</span>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">{unlockModalState.prod.category}</span>
                <h4 className="text-xs font-bold text-white truncate">{unlockModalState.prod.name}</h4>
                <span className="text-xs font-mono font-bold text-emerald-400">₹{unlockModalState.prod.price}</span>
              </div>
            </div>

            {/* Patient Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                <span>Select Target Patient for Unlock *</span>
              </label>
              <select
                value={selectedPatientForUnlock}
                onChange={(e) => setSelectedPatientForUnlock(e.target.value)}
                className="w-full bg-slate-950 border border-indigo-500/50 rounded-xl p-3 text-xs text-white font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                {patients.map((pt) => (
                  <option key={pt.id} value={pt.id}>
                    {pt.photo} {pt.name} ({pt.age} yrs, {pt.gender}) — {pt.concern}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400">
                Unlocking will permit this patient to order this prescription treatment from DermPharmacy.
              </p>
            </div>

            {/* Optional Clinical Note */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-300">
                Clinical Authorization Note (Optional)
              </label>
              <input
                type="text"
                value={unlockAuthNote}
                onChange={(e) => setUnlockAuthNote(e.target.value)}
                placeholder="e.g. Approved for 4-week acne treatment regimen"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center space-x-3">
              <button
                onClick={() => setUnlockModalState(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPatientUnlock}
                className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-1.5 transition-all"
              >
                <Unlock className="w-4 h-4" />
                <span>Confirm & Unlock 🔓</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
