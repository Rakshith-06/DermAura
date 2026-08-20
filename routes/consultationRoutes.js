import express from 'express';
import Consultation from '../models/Consultation.js';

const router = express.Router();

// ── In-Memory Fallback Store for Hackathon Demo Mode ───────────────────────
const mockConsultations = new Map();

/**
 * Helper to format numeric amounts into INR ₹ string
 */
const formatINR = (val) => `₹${Number(val).toLocaleString('en-IN')}`;

/**
 * ────────────────────────────────────────────────────────────────────────────
 * 1. POST /api/consultations/one-time
 * ── Initializes a 1-Time Session (24-Hr Auto Expiry) ────────────────────────
 * ────────────────────────────────────────────────────────────────────────────
 */
router.post('/one-time', async (req, res) => {
  try {
    const {
      patientId,
      leadDoctorId,
      assignedDoctorId,
      chiefComplaint,
      skinType,
      photos,
      amountPaid = 300, // Default 1-time consultation fee in INR ₹
    } = req.body;

    // ── Input Validation ───────────────────────────────────────────────────
    if (!patientId || !leadDoctorId || !chiefComplaint) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'patientId, leadDoctorId, and chiefComplaint are mandatory fields',
      });
    }

    if (amountPaid <= 0) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'amountPaid must be greater than ₹0',
      });
    }

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from creation
    const effectiveAssignedDoc = assignedDoctorId || leadDoctorId;

    let consultationDoc;

    try {
      consultationDoc = await Consultation.create({
        patientId,
        leadDoctorId,
        assignedDoctorId: effectiveAssignedDoc,
        chiefComplaint,
        skinType: skinType || 'Unspecified',
        photos: Array.isArray(photos) ? photos : [],
        type: 'ONE_TIME_SUGGESTION',
        status: 'REQUESTED',
        expiresAt,
        totalDays: 1,
        totalAmount: amountPaid,
        dailyRate: amountPaid,
        escrowRemaining: 0, // Direct payment, no multi-day escrow lock
      });
    } catch (dbErr) {
      // Fallback for Demo API mode without active MongoDB connection
      const mockId = `consult-ot-${Date.now()}`;
      consultationDoc = {
        _id: mockId,
        id: mockId,
        patientId,
        leadDoctorId,
        assignedDoctorId: effectiveAssignedDoc,
        chiefComplaint,
        skinType: skinType || 'Unspecified',
        photos: Array.isArray(photos) ? photos : [],
        type: 'ONE_TIME_SUGGESTION',
        status: 'REQUESTED',
        expiresAt,
        totalDays: 1,
        totalAmount: amountPaid,
        dailyRate: amountPaid,
        escrowRemaining: 0,
        createdAt: new Date(),
      };
      mockConsultations.set(mockId, consultationDoc);
    }

    return res.status(201).json({
      success: true,
      message: 'One-time consultation requested successfully. Waiting for doctor to accept and start meet.',
      consultation: {
        id: consultationDoc._id || consultationDoc.id,
        patientId: consultationDoc.patientId,
        leadDoctorId: consultationDoc.leadDoctorId,
        assignedDoctorId: consultationDoc.assignedDoctorId,
        type: consultationDoc.type,
        status: consultationDoc.status,
        skinType: consultationDoc.skinType,
        chiefComplaint: consultationDoc.chiefComplaint,
        photos: consultationDoc.photos,
        expiresAt: consultationDoc.expiresAt,
        financials: {
          currency: 'INR',
          symbol: '₹',
          amountPaid: Number(amountPaid),
          formattedAmountPaid: formatINR(amountPaid),
          paymentModel: 'DIRECT_PAYOUT',
        },
      },
    });
  } catch (err) {
    console.error('Error creating one-time consultation:', err);
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Failed to create one-time consultation: ' + err.message,
    });
  }
});

/**
 * ────────────────────────────────────────────────────────────────────────────
 * PATCH /api/consultations/:id/accept
 * ── Doctor accepts patient 24-hr session request and starts meet ──────────
 * ────────────────────────────────────────────────────────────────────────────
 */
router.patch('/:id/accept', async (req, res) => {
  try {
    const { id } = req.params;
    let consultation;
    try {
      consultation = await Consultation.findById(id);
    } catch (e) {}

    if (!consultation && mockConsultations.has(id)) {
      consultation = mockConsultations.get(id);
    }

    if (!consultation) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Consultation request not found',
      });
    }

    if (consultation.save && typeof consultation.save === 'function') {
      consultation.status = 'ACCEPTED';
      await consultation.save();
    } else {
      consultation.status = 'ACCEPTED';
      mockConsultations.set(id, consultation);
    }

    return res.json({
      success: true,
      message: 'Consultation request accepted. Session meet initiated!',
      consultation,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: err.message,
    });
  }
});

/**
 * ────────────────────────────────────────────────────────────────────────────
 * 2. POST /api/consultations/multi-day
 * ── Initializes a Multi-Day Treatment Package & Locks Escrow ────────────────
 * ────────────────────────────────────────────────────────────────────────────
 */
router.post('/multi-day', async (req, res) => {
  try {
    const {
      patientId,
      leadDoctorId,
      assignedDoctorId,
      chiefComplaint,
      skinType,
      photos,
      totalDays = 10,
      totalAmount = 3000, // Total package fee in INR ₹
    } = req.body;

    // ── Input Validation ───────────────────────────────────────────────────
    if (!patientId || !leadDoctorId || !chiefComplaint) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'patientId, leadDoctorId, and chiefComplaint are mandatory fields',
      });
    }

    if (totalDays <= 0) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'totalDays must be at least 1 day',
      });
    }

    if (totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'totalAmount must be greater than ₹0',
      });
    }

    // ── Financial Escrow Calculations ─────────────────────────────────────
    const dailyRate = Math.round(Number(totalAmount) / Number(totalDays));
    const escrowRemaining = Number(totalAmount); // Lock 100% of amount in escrow initially
    const effectiveAssignedDoc = assignedDoctorId || leadDoctorId;

    let consultationDoc;

    try {
      consultationDoc = await Consultation.create({
        patientId,
        leadDoctorId,
        assignedDoctorId: effectiveAssignedDoc,
        chiefComplaint,
        skinType: skinType || 'Unspecified',
        photos: Array.isArray(photos) ? photos : [],
        type: 'MULTI_DAY_TREATMENT',
        status: 'ACTIVE',
        totalDays: Number(totalDays),
        totalAmount: Number(totalAmount),
        dailyRate,
        escrowRemaining,
      });
    } catch (dbErr) {
      // Fallback for Demo API mode without active MongoDB connection
      const mockId = `consult-md-${Date.now()}`;
      consultationDoc = {
        _id: mockId,
        id: mockId,
        patientId,
        leadDoctorId,
        assignedDoctorId: effectiveAssignedDoc,
        chiefComplaint,
        skinType: skinType || 'Unspecified',
        photos: Array.isArray(photos) ? photos : [],
        type: 'MULTI_DAY_TREATMENT',
        status: 'ACTIVE',
        totalDays: Number(totalDays),
        totalAmount: Number(totalAmount),
        dailyRate,
        escrowRemaining,
        transferLogs: [],
        createdAt: new Date(),
      };
      mockConsultations.set(mockId, consultationDoc);
    }

    return res.status(201).json({
      success: true,
      message: `Multi-day consultation package initialized. ${formatINR(totalAmount)} locked in escrow at ${formatINR(dailyRate)}/day.`,
      consultation: {
        id: consultationDoc._id || consultationDoc.id,
        patientId: consultationDoc.patientId,
        leadDoctorId: consultationDoc.leadDoctorId,
        assignedDoctorId: consultationDoc.assignedDoctorId,
        type: consultationDoc.type,
        status: consultationDoc.status,
        chiefComplaint: consultationDoc.chiefComplaint,
        photos: consultationDoc.photos,
        totalDays: consultationDoc.totalDays,
        dailyRate: consultationDoc.dailyRate,
        totalAmount: consultationDoc.totalAmount,
        escrowRemaining: consultationDoc.escrowRemaining,
        financials: {
          currency: 'INR',
          symbol: '₹',
          totalAmount: consultationDoc.totalAmount,
          totalAmountFormatted: formatINR(consultationDoc.totalAmount),
          dailyRate: consultationDoc.dailyRate,
          dailyRateFormatted: `${formatINR(consultationDoc.dailyRate)}/day`,
          escrowLocked: consultationDoc.escrowRemaining,
          escrowLockedFormatted: formatINR(consultationDoc.escrowRemaining),
        },
      },
    });
  } catch (err) {
    console.error('Error creating multi-day consultation:', err);
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Failed to create multi-day consultation: ' + err.message,
    });
  }
});

/**
 * ────────────────────────────────────────────────────────────────────────────
 * 3. POST /api/consultations/transfer
 * ── Mid-Treatment Doctor Switch with Financial Escrow Re-allocation ─────────
 * ────────────────────────────────────────────────────────────────────────────
 */
router.post('/transfer', async (req, res) => {
  try {
    const {
      consultationId,
      requestingDoctorId, // Doctor A (currently assigned)
      newDoctorId,        // Doctor B (new attending specialist)
      daysServed,         // e.g. 4 days completed by Doctor A
      handoffNotes,       // Mandatory clinical handoff summary
      reason,             // Reason for transfer
    } = req.body;

    // ── Input Validation ───────────────────────────────────────────────────
    if (!consultationId || !requestingDoctorId || !newDoctorId) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'consultationId, requestingDoctorId, and newDoctorId are required',
      });
    }

    if (!handoffNotes || !handoffNotes.trim()) {
      return res.status(400).json({
        success: false,
        error: 'MANDATORY_HANDOFF_NOTES_REQUIRED',
        message: 'Doctor A must provide mandatory handoffNotes explaining patient condition before transfer',
      });
    }

    if (daysServed === undefined || daysServed === null || Number(daysServed) < 0) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'daysServed must be a non-negative number',
      });
    }

    // ── Retrieve Consultation Document ─────────────────────────────────────
    let consultation;
    try {
      consultation = await Consultation.findById(consultationId);
    } catch (e) {}

    if (!consultation && mockConsultations.has(consultationId)) {
      consultation = mockConsultations.get(consultationId);
    }

    if (!consultation) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: `Consultation with ID '${consultationId}' was not found`,
      });
    }

    if (consultation.type !== 'MULTI_DAY_TREATMENT') {
      return res.status(400).json({
        success: false,
        error: 'INVALID_TRANSFER_OPERATION',
        message: 'Doctor transfer and escrow re-allocation is only applicable to MULTI_DAY_TREATMENT consultations',
      });
    }

    const totalDays = consultation.totalDays || 1;
    const dailyRate = consultation.dailyRate || Math.round((consultation.totalAmount || 0) / totalDays);
    const initialEscrow = consultation.escrowRemaining ?? consultation.totalAmount ?? 0;

    const numDaysServed = Math.min(Number(daysServed), totalDays);

    // ── Itemized Financial Payout & Escrow Calculations ───────────────────
    const payoutToPreviousDoctor = numDaysServed * dailyRate;
    const remainingTransferredEscrow = Math.max(0, initialEscrow - payoutToPreviousDoctor);

    // ── Build Transfer Log Subdocument ─────────────────────────────────────
    const transferEntry = {
      fromDoctorId: requestingDoctorId,
      toDoctorId: newDoctorId,
      transferredBy: requestingDoctorId,
      transferredAt: new Date(),
      reason: reason || handoffNotes.trim(),
    };

    // ── Update Record State ────────────────────────────────────────────────
    let updatedConsultation;

    if (consultation.save && typeof consultation.save === 'function') {
      // Mongoose Doc Update
      consultation.assignedDoctorId = newDoctorId;
      consultation.escrowRemaining = remainingTransferredEscrow;
      consultation.handoffNotes = (consultation.handoffNotes ? consultation.handoffNotes + '\n\n' : '') +
        `[Transfer Handoff Notes]: ${handoffNotes.trim()}`;
      consultation.transferLogs.push(transferEntry);
      updatedConsultation = await consultation.save();
    } else {
      // Mock Fallback Update
      consultation.assignedDoctorId = newDoctorId;
      consultation.escrowRemaining = remainingTransferredEscrow;
      consultation.handoffNotes = (consultation.handoffNotes ? consultation.handoffNotes + '\n\n' : '') +
        `[Transfer Handoff Notes]: ${handoffNotes.trim()}`;
      if (!consultation.transferLogs) consultation.transferLogs = [];
      consultation.transferLogs.push(transferEntry);
      mockConsultations.set(consultationId, consultation);
      updatedConsultation = consultation;
    }

    // ── Return Itemized Financial Summary (INR / ₹) ────────────────────────
    return res.status(200).json({
      success: true,
      message: `Consultation successfully transferred to Dr. ${newDoctorId}. Previous doctor paid ${formatINR(payoutToPreviousDoctor)} for ${numDaysServed} day(s). Remaining ${formatINR(remainingTransferredEscrow)} transferred in escrow.`,
      transferSummary: {
        consultationId: updatedConsultation._id || updatedConsultation.id,
        patientId: updatedConsultation.patientId,
        previousDoctorId: requestingDoctorId,
        newDoctorId: newDoctorId,
        daysServedByPreviousDoctor: numDaysServed,
        handoffNotes: handoffNotes.trim(),
        transferredAt: transferEntry.transferredAt,
        financialBreakdown: {
          currency: 'INR',
          symbol: '₹',
          totalPackageAmount: updatedConsultation.totalAmount,
          dailyRate: dailyRate,
          amountEarnedByPreviousDoctor: payoutToPreviousDoctor,
          amountTransferredToNewDoctor: remainingTransferredEscrow,
          escrowRemaining: remainingTransferredEscrow,
          formatted: {
            totalPackage: formatINR(updatedConsultation.totalAmount),
            dailyRate: `${formatINR(dailyRate)}/day`,
            previousDoctorPayout: formatINR(payoutToPreviousDoctor),
            newDoctorEscrowBalance: formatINR(remainingTransferredEscrow),
          },
        },
      },
    });
  } catch (err) {
    console.error('Error executing doctor transfer:', err);
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Failed to process consultation transfer: ' + err.message,
    });
  }
});

/**
 * ────────────────────────────────────────────────────────────────────────────
 * GET /api/consultations/:id
 * ── Fetch Consultation Details & Transfer History ───────────────────────────
 * ────────────────────────────────────────────────────────────────────────────
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let consultation;

    try {
      consultation = await Consultation.findById(id);
    } catch (e) {}

    if (!consultation && mockConsultations.has(id)) {
      consultation = mockConsultations.get(id);
    }

    if (!consultation) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Consultation not found',
      });
    }

    return res.json({
      success: true,
      consultation,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: err.message,
    });
  }
});

export default router;
