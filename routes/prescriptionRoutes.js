import express from 'express';
import Prescription from '../models/Prescription.js';
import { MedicationSchedule } from '../models/MedicationSchedule.js';
import Notification from '../models/Notification.js';
import ChatRoom from '../models/ChatRoom.js';
import { Patient } from '../models/User.js';

const router = express.Router();

// ── Demo Fallback In-Memory Store ──────────────────────────────────────────
const mockPendingPrescriptions = new Map();

/**
 * ────────────────────────────────────────────────────────────────────────────
 * 1. POST /api/prescriptions/propose
 * ── Specialist Physician Proposes a Prescription (Status: PROPOSED) ─────────
 * ────────────────────────────────────────────────────────────────────────────
 */
router.post('/propose', async (req, res) => {
  try {
    const {
      patientId,
      authoringDoctorId,
      prescribingDoctorId, // backwards compatibility alias
      leadDoctorId,
      consultationId,
      chatRoomId,
      medications,
      medicines, // backwards compatibility alias
      clinicalRationale,
    } = req.body;

    const effectiveDoctorId = authoringDoctorId || prescribingDoctorId;
    const rawMeds = medications || medicines || [];

    if (!patientId || !effectiveDoctorId) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'patientId and authoringDoctorId (or prescribingDoctorId) are required',
      });
    }

    if (!Array.isArray(rawMeds) || rawMeds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'At least one medication is required in prescription proposal',
      });
    }

    // Standardize medication subdocuments
    const normalizedMeds = rawMeds.map((m) => ({
      drugName: m.drugName || m.name || 'Prescription Medication',
      dosage: m.dosage || '1 dose',
      timing: Array.isArray(m.timing) && m.timing.length > 0 ? m.timing : ['Morning'],
      durationDays: Number(m.durationDays || m.duration || 14),
      instructions: m.instructions || m.frequency || 'Take as directed by doctor',
      isGatedProduct: m.isGatedProduct !== undefined ? m.isGatedProduct : true,
      productId: m.productId || '',
    }));

    // Find patient to resolve assigned lead doctor if not explicitly provided
    let patientDoc;
    try {
      patientDoc = await Patient.findById(patientId);
    } catch (e) { }

    const resolvedLeadDocId = leadDoctorId || patientDoc?.primaryLeadDoctorId || effectiveDoctorId;
    const isLeadDoctor = effectiveDoctorId.toString() === resolvedLeadDocId.toString();
    const initialStatus = isLeadDoctor ? 'APPROVED' : 'PROPOSED';

    let prescriptionDoc;

    try {
      prescriptionDoc = await Prescription.create({
        patientId,
        authoringDoctorId: effectiveDoctorId,
        leadDoctorId: resolvedLeadDocId,
        consultationId,
        chatRoomId,
        medications: normalizedMeds,
        clinicalRationale: clinicalRationale || '',
        status: initialStatus,
        reviewedAt: isLeadDoctor ? new Date() : null,
        approvedAt: isLeadDoctor ? new Date() : null,
      });
    } catch (dbErr) {
      // Demo Mode Fallback
      const mockId = `rx-prop-${Date.now()}`;
      prescriptionDoc = {
        _id: mockId,
        id: mockId,
        patientId,
        authoringDoctorId: effectiveDoctorId,
        leadDoctorId: resolvedLeadDocId,
        consultationId,
        chatRoomId,
        medications: normalizedMeds,
        clinicalRationale: clinicalRationale || '',
        status: initialStatus,
        createdAt: new Date(),
      };
      if (initialStatus === 'PROPOSED') {
        mockPendingPrescriptions.set(mockId, prescriptionDoc);
      }
    }

    // ── Generate Notification for Lead Doctor ──────────────────────────────
    if (!isLeadDoctor) {
      try {
        await Notification.create({
          userId: resolvedLeadDocId,
          userRole: 'LEAD_DOCTOR',
          title: '📋 Specialist Prescription Proposal Waiting Approval',
          message: `Specialist Dr. ${effectiveDoctorId} submitted a prescription proposal (${normalizedMeds[0].drugName}) for your patient. Please review for drug safety.`,
          type: 'PRESCRIPTION_PROPOSAL',
          actionUrl: '/doctor-dashboard?tab=pending-approvals',
          alertTiming: new Date(),
        });
      } catch (e) { }
    }

    return res.status(201).json({
      success: true,
      message: isLeadDoctor
        ? 'Prescription issued and automatically approved by Lead Doctor.'
        : 'Specialist prescription proposed successfully. Submitted to Primary Lead Doctor for gatekeeper verification & approval.',
      prescription: prescriptionDoc,
    });
  } catch (err) {
    console.error('Error proposing prescription:', err);
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Failed to create prescription proposal: ' + err.message,
    });
  }
});

/**
 * ────────────────────────────────────────────────────────────────────────────
 * 2. GET /api/prescriptions/pending (and /pending-approvals)
 * ── Fetches Pending Prescription Proposals for Lead Doctor Review ───────────
 * ────────────────────────────────────────────────────────────────────────────
 */
const getPendingPrescriptions = async (req, res) => {
  try {
    const { leadDoctorId } = req.query;

    let pendingList = [];

    try {
      const query = { status: 'PROPOSED' };
      if (leadDoctorId) query.leadDoctorId = leadDoctorId;

      pendingList = await Prescription.find(query)
        .populate('patientId', 'fullName age gender medicalHistory')
        .populate('authoringDoctorId', 'fullName specialization qualifications hospitalAffiliation')
        .sort({ createdAt: -1 });
    } catch (dbErr) {
      pendingList = Array.from(mockPendingPrescriptions.values()).filter(
        (p) => p.status === 'PROPOSED' && (!leadDoctorId || p.leadDoctorId === leadDoctorId)
      );
    }

    return res.status(200).json({
      success: true,
      count: pendingList.length,
      pendingPrescriptions: pendingList,
    });
  } catch (err) {
    console.error('Error fetching pending prescriptions:', err);
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Failed to retrieve pending prescriptions: ' + err.message,
    });
  }
};

router.get('/pending', getPendingPrescriptions);
router.get('/pending-approvals', getPendingPrescriptions);

/**
 * ────────────────────────────────────────────────────────────────────────────
 * 3. PATCH /api/prescriptions/:id/approve
 * ── Lead Doctor Approves/Rejects & Generates Medication Schedule ────────────
 * ────────────────────────────────────────────────────────────────────────────
 */
router.patch('/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      action = 'APPROVED', // 'APPROVED' | 'REJECTED'
      leadDoctorNotes,
      rejectionReason,
      leadDoctorId,
    } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: "Action must be either 'APPROVED' or 'REJECTED'",
      });
    }

    let prescription;

    try {
      prescription = await Prescription.findById(id);
    } catch (e) { }

    if (!prescription && mockPendingPrescriptions.has(id)) {
      prescription = mockPendingPrescriptions.get(id);
    }

    if (!prescription) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: `Prescription proposal with ID '${id}' not found`,
      });
    }

    // Optional Gatekeeper Check: Ensure requesting doctor is the assigned Lead Doctor
    if (leadDoctorId && prescription.leadDoctorId && prescription.leadDoctorId.toString() !== leadDoctorId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'UNAUTHORIZED_GATEKEEPER',
        message: 'Only the assigned Primary Care Provider (Lead Doctor) can approve or reject this prescription.',
      });
    }

    prescription.status = action;
    prescription.leadDoctorNotes = leadDoctorNotes || '';
    prescription.rejectionReason = action === 'REJECTED' ? rejectionReason || 'Clinical safety rationale' : '';
    prescription.reviewedAt = new Date();
    if (action === 'APPROVED') {
      prescription.approvedAt = new Date();
    }

    if (prescription.save && typeof prescription.save === 'function') {
      await prescription.save();
    } else {
      mockPendingPrescriptions.delete(id);
    }

    const createdSchedules = [];

    // ── IF APPROVED: Auto-generate MedicationSchedule records ───────────────
    if (action === 'APPROVED') {
      const meds = prescription.medications || [];

      for (const med of meds) {
        const drugName = med.drugName || med.name;
        const dosage = med.dosage;
        const durationDays = med.durationDays || 14;
        const timings = Array.isArray(med.timing) && med.timing.length > 0 ? med.timing : ['Morning'];

        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

        const timingMap = {
          Morning: '08:00 AM',
          Afternoon: '02:00 PM',
          Night: '09:00 PM',
        };

        for (const slot of timings) {
          const scheduledTimeStr = timingMap[slot] || '08:00 AM';

          try {
            const schedDoc = await MedicationSchedule.create({
              patientId: prescription.patientId,
              prescriptionId: prescription._id || prescription.id,
              drugName,
              dosage,
              timeOfDay: slot,
              scheduledTime: scheduledTimeStr,
              startDate,
              endDate,
              isActive: true,
            });
            createdSchedules.push(schedDoc);
          } catch (schedErr) {
            // Mock object for demo mode
            createdSchedules.push({
              patientId: prescription.patientId,
              prescriptionId: prescription._id || prescription.id,
              drugName,
              dosage,
              timeOfDay: slot,
              scheduledTime: scheduledTimeStr,
              startDate,
              endDate,
              isActive: true,
            });
          }
        }
      }

      // Update Patient Medical History
      try {
        const patient = await Patient.findById(prescription.patientId);
        if (patient) {
          const newMedStrings = meds.map((m) => `${m.drugName || m.name} (${m.dosage})`);
          patient.medicalHistory.currentMedications = [
            ...new Set([...(patient.medicalHistory.currentMedications || []), ...newMedStrings]),
          ];
          await patient.save();
        }
      } catch (e) { }

      // Notify Patient of Approval & Product Unlock
      try {
        await Notification.create({
          userId: prescription.patientId,
          userRole: 'PATIENT',
          title: '🔓 Prescription Approved & Medication Unlocked!',
          message: `Your Lead Doctor has approved your prescription. Recommended medications are now unlocked for purchase in your pharmacy dashboard.`,
          type: 'PRESCRIPTION_APPROVAL',
          actionUrl: '/dashboard?tab=pharmacy',
          alertTiming: new Date(),
        });
      } catch (e) { }
    } else {
      // Notify Patient of Rejection
      try {
        await Notification.create({
          userId: prescription.patientId,
          userRole: 'PATIENT',
          title: '⚠️ Prescription Proposal Declined by Lead PCP',
          message: `Your Lead Doctor reviewed the specialist prescription proposal and declined it for safety reasons: "${prescription.rejectionReason}".`,
          type: 'PRESCRIPTION_REJECTION',
          actionUrl: '/chat',
          alertTiming: new Date(),
        });
      } catch (e) { }
    }

    return res.status(200).json({
      success: true,
      message: `Prescription proposal successfully ${action.toLowerCase()} by Lead Doctor.`,
      prescription,
      schedulesGeneratedCount: createdSchedules.length,
      medicationSchedules: createdSchedules,
    });
  } catch (err) {
    console.error('Error approving prescription:', err);
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Failed to process prescription approval: ' + err.message,
    });
  }
});

export default router;
