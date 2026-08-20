/**
 * routes/reportRoutes.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Automated Health Report Routing — DermAura
 *
 * POST /api/reports/analyze
 *   • Accepts a completed DermScan or StressAnalyzer payload.
 *   • Auto-resolves leadDoctorId from patient.primaryLeadDoctorId.
 *   • Saves the report to MongoDB (or falls back to localStorage sync signal).
 *   • Fires Socket.io event NEW_CLINICAL_REPORT_ATTACHED to:
 *       1. The lead doctor's personal room  ("doctor:<leadDoctorId>")
 *       2. The shared consultation room     ("consult:<patientId>")
 *   • Inserts a system-generated chat message into localStorage for the
 *     demo-mode chatroom thread so the banner appears instantly without
 *     a full Socket.io integration.
 *
 * GET /api/reports/doctor/:doctorId
 *   • Returns all unreviewed reports routed to the given doctor.
 *
 * PATCH /api/reports/:reportId/reviewed
 *   • Marks a report as REVIEWED (doctor acknowledged).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import express from 'express';
import mongoose from 'mongoose';
import { Patient } from '../models/User.js';
import DermScanReport from '../models/DermScanReport.js';
import StressReport from '../models/StressReport.js';

const router = express.Router();

// ── Shared in-process report store (used when MongoDB is unavailable) ─────────
// In production this would be Redis or a proper message queue.
// In demo mode it acts as the cross-request "database".
const inMemoryReports = [];

// ── Helper: derive cortisol risk tier from percentage score ──────────────────
const deriveCortisolRisk = (percentage) => {
  if (percentage >= 80) return 'CRITICAL';
  if (percentage >= 65) return 'HIGH';
  if (percentage >= 30) return 'MODERATE';
  return 'LOW';
};

// ── Helper: derive HRV indicator from stress tier ────────────────────────────
const deriveHrvIndicator = (cortisolRisk) => {
  const map = {
    LOW:      'Normal HRV',
    MODERATE: 'Mildly Reduced HRV (Cortisol Elevation)',
    HIGH:     'Significantly Reduced HRV (Stress-Induced Suppression)',
    CRITICAL: 'Severely Reduced HRV — Immediate Clinical Review Advised',
  };
  return map[cortisolRisk] || 'Normal HRV';
};

// ── Helper: skin-stress correlation label ────────────────────────────────────
const deriveSkinCorrelation = (percentage) => {
  if (percentage >= 65) return 'High correlation — Inflammatory skin flares likely';
  if (percentage >= 30) return 'Moderate correlation — T-zone sebum increase possible';
  return 'Low correlation — Minimal stress-induced skin impact expected';
};

// ── Helper: emit Socket.io + chat banner ─────────────────────────────────────
/**
 * Pushes the NEW_CLINICAL_REPORT_ATTACHED event if Socket.io is available.
 * Falls back gracefully to a console log (demo mode without Socket.io).
 *
 * @param {object} io              — Socket.io server instance (may be null in demo mode)
 * @param {object} reportPayload   — The full report document (or in-memory equivalent)
 * @param {string} reportType      — 'DERMSCAN' | 'STRESS'
 */
const emitReportEvent = (io, reportPayload, reportType) => {
  const leadDoctorId = reportPayload.leadDoctorId?.toString();
  const patientId    = reportPayload.patientId?.toString();

  const eventPayload = {
    eventType:        'NEW_CLINICAL_REPORT_ATTACHED',
    reportType,                               // 'DERMSCAN' | 'STRESS'
    reportId:         reportPayload._id?.toString() || reportPayload.id,
    patientId,
    patientName:      reportPayload.patientSnapshot?.fullName || 'Patient',
    leadDoctorId,
    deliveryStatus:   'DELIVERED_TO_LEAD',
    reportSummary:    reportPayload.reportData?.condition || reportPayload.reportData?.category || '',
    confidence:       reportPayload.reportData?.confidence || '',
    severity:         reportPayload.reportData?.severity || reportPayload.reportData?.cortisolRiskLevel || '',
    timestamp:        new Date().toISOString(),
    systemBannerText: reportType === 'DERMSCAN'
      ? `🤖 SYSTEM AUTOMATION: New AI DermScan Report auto-attached to patient chart. Condition: ${reportPayload.reportData?.condition || 'Pending Review'} (${reportPayload.reportData?.confidence || '—'} confidence). [View Analysis Report]`
      : `🤖 SYSTEM AUTOMATION: New Stress Analyzer Report auto-attached to patient chart. Risk Level: ${reportPayload.reportData?.category || 'Pending Review'}. [View Stress Analysis]`,
  };

  if (io) {
    // ── Room 1: Lead doctor's personal notification room ──────────────────
    if (leadDoctorId) {
      io.to(`doctor:${leadDoctorId}`).emit('NEW_CLINICAL_REPORT_ATTACHED', eventPayload);
    }

    // ── Room 2: Shared consultation thread ────────────────────────────────
    if (patientId) {
      io.to(`consult:${patientId}`).emit('NEW_CLINICAL_REPORT_ATTACHED', eventPayload);
    }

    console.log(
      `[reportRoutes] 📡 Socket.io event emitted → doctor:${leadDoctorId} & consult:${patientId}`,
      `(${reportType})`
    );
  } else {
    // ── Demo mode: log the event; frontend polling picks it up via localStorage ──
    console.log(`[reportRoutes] 📋 Demo mode — Socket.io unavailable. Report stored in memory.`, {
      reportType,
      patientId,
      leadDoctorId,
    });
  }

  return eventPayload;
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/reports/analyze
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Main report submission endpoint. Called after AI DermScan or Stress Analyzer
 * completes on the frontend.
 *
 * Request body:
 * {
 *   reportType:  'DERMSCAN' | 'STRESS'          // required
 *   patientId:   string                          // required
 *   reportData:  { ...scan or stress fields }    // required
 *   patientSnapshot: { fullName, age, gender }   // optional, avoids extra DB lookup
 *   consultationId: string                       // optional
 * }
 *
 * Response:
 * {
 *   success:       boolean
 *   report:        DermScanReport | StressReport (or in-memory equivalent)
 *   eventPayload:  object  — the Socket.io event that was emitted
 *   source:        'mongodb' | 'demo'
 * }
 */
router.post('/analyze', async (req, res) => {
  try {
    const { reportType, patientId, reportData, patientSnapshot, consultationId } = req.body;

    // ── Input validation ──────────────────────────────────────────────────────
    if (!reportType || !['DERMSCAN', 'STRESS'].includes(reportType)) {
      return res.status(400).json({
        success: false,
        message: 'reportType must be "DERMSCAN" or "STRESS".',
      });
    }
    if (!patientId) {
      return res.status(400).json({ success: false, message: 'patientId is required.' });
    }
    if (!reportData || typeof reportData !== 'object') {
      return res.status(400).json({ success: false, message: 'reportData payload is required.' });
    }

    // ── Retrieve Socket.io instance (attached by server.js on app object) ─────
    // In demo mode this will be null — graceful fallback below.
    const io = req.app.get('io') || null;

    // ─────────────────────────────────────────────────────────────────────────
    // MongoDB path
    // ─────────────────────────────────────────────────────────────────────────
    if (mongoose.connection.readyState === 1) {
      // ── Step 1: Resolve leadDoctorId from patient record ──────────────────
      const patientRecord = await Patient.findById(patientId)
        .select('primaryLeadDoctorId fullName age gender')
        .lean();

      if (!patientRecord) {
        return res.status(404).json({ success: false, message: 'Patient not found.' });
      }

      const leadDoctorId = patientRecord.primaryLeadDoctorId;
      if (!leadDoctorId) {
        return res.status(400).json({
          success: false,
          message: 'Patient has not selected a Lead Primary Doctor yet. Report cannot be routed.',
        });
      }

      const snapshot = patientSnapshot || {
        fullName: patientRecord.fullName,
        age:      patientRecord.age,
        gender:   patientRecord.gender,
      };

      let savedReport;

      // ── Step 2a: Save DermScan report ─────────────────────────────────────
      if (reportType === 'DERMSCAN') {
        const scan = new DermScanReport({
          patientId,
          leadDoctorId,
          scanType:      reportData.scanType || 'FACIAL',
          reportData:    {
            condition:       reportData.condition,
            confidence:      reportData.confidence,
            severity:        reportData.severity,
            affectedArea:    reportData.affectedArea,
            summary:         reportData.summary,
            recommendations: reportData.recommendations || [],
            recommendedRxId: reportData.recommendedRxId || '',
            scanImageUrl:    reportData.scanImageUrl || reportData.imageUrl || '',
            rawScores:       reportData.rawScores || {},
          },
          deliveryStatus:  'PENDING',
          consultationId:  consultationId || null,
          patientSnapshot: snapshot,
        });
        savedReport = await scan.save();
      }

      // ── Step 2b: Save Stress report ───────────────────────────────────────
      if (reportType === 'STRESS') {
        const cortisolRisk = deriveCortisolRisk(reportData.percentage || 0);
        const stress = new StressReport({
          patientId,
          leadDoctorId,
          reportData: {
            score:                reportData.score,
            maxPts:               reportData.maxPts || 20,
            percentage:           reportData.percentage,
            category:             reportData.category,
            summary:              reportData.summary,
            recommendations:      reportData.recommendations || [],
            detailedAnswers:      reportData.detailedAnswers || [],
            cortisolRiskLevel:    cortisolRisk,
            hrvIndicator:         deriveHrvIndicator(cortisolRisk),
            skinStressCorrelation: deriveSkinCorrelation(reportData.percentage || 0),
          },
          deliveryStatus:  'PENDING',
          consultationId:  consultationId || null,
          patientSnapshot: snapshot,
        });
        savedReport = await stress.save();
      }

      // ── Step 3: Mark as DELIVERED and emit event ──────────────────────────
      savedReport.deliveryStatus = 'DELIVERED_TO_LEAD';
      savedReport.deliveredAt    = new Date();
      await savedReport.save();

      const eventPayload = emitReportEvent(io, savedReport.toObject(), reportType);

      return res.status(201).json({
        success: true,
        message: `${reportType} report saved and auto-routed to Lead Doctor.`,
        report:  savedReport,
        eventPayload,
        source:  'mongodb',
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Demo / In-Memory Fallback
    // ─────────────────────────────────────────────────────────────────────────
    // When MongoDB is not running, we construct the report object in-memory,
    // emit the Socket.io event (if available), and return it so the frontend
    // can write it to localStorage for cross-tab sync.
    const leadDoctorId = req.body.leadDoctorId || 'demo-doctor-002';

    const snapshot = patientSnapshot || { fullName: 'Demo Patient', age: 28, gender: 'Male' };

    let demoReport;

    if (reportType === 'DERMSCAN') {
      demoReport = {
        _id:            `scan-report-${Date.now()}`,
        id:             `scan-report-${Date.now()}`,
        patientId,
        leadDoctorId,
        scanType:       reportData.scanType || 'FACIAL',
        reportData: {
          condition:       reportData.condition,
          confidence:      reportData.confidence,
          severity:        reportData.severity,
          affectedArea:    reportData.affectedArea,
          summary:         reportData.summary,
          recommendations: reportData.recommendations || [],
          recommendedRxId: reportData.recommendedRxId || '',
          scanImageUrl:    reportData.scanImageUrl || reportData.imageUrl || '',
          rawScores:       reportData.rawScores || {},
        },
        deliveryStatus:  'DELIVERED_TO_LEAD',
        deliveredAt:     new Date().toISOString(),
        consultationId:  consultationId || null,
        patientSnapshot: snapshot,
        createdAt:       new Date().toISOString(),
      };
    } else {
      const cortisolRisk = deriveCortisolRisk(reportData.percentage || 0);
      demoReport = {
        _id:        `stress-report-${Date.now()}`,
        id:         `stress-report-${Date.now()}`,
        patientId,
        leadDoctorId,
        reportData: {
          score:                reportData.score,
          maxPts:               reportData.maxPts || 20,
          percentage:           reportData.percentage,
          category:             reportData.category,
          summary:              reportData.summary,
          recommendations:      reportData.recommendations || [],
          detailedAnswers:      reportData.detailedAnswers || [],
          cortisolRiskLevel:    cortisolRisk,
          hrvIndicator:         deriveHrvIndicator(cortisolRisk),
          skinStressCorrelation: deriveSkinCorrelation(reportData.percentage || 0),
        },
        deliveryStatus:  'DELIVERED_TO_LEAD',
        deliveredAt:     new Date().toISOString(),
        consultationId:  consultationId || null,
        patientSnapshot: snapshot,
        createdAt:       new Date().toISOString(),
      };
    }

    inMemoryReports.unshift(demoReport);

    const eventPayload = emitReportEvent(io, demoReport, reportType);

    return res.status(201).json({
      success: true,
      message: `${reportType} report auto-routed to Lead Doctor (Demo Mode).`,
      report:  demoReport,
      eventPayload,
      source:  'demo',
    });

  } catch (error) {
    console.error('[reportRoutes] POST /analyze error:', error);
    return res.status(500).json({
      success: false,
      message: 'Report routing failed.',
      error:   error.message,
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/reports/doctor/:doctorId
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Returns all DermScan and Stress reports routed to the given lead doctor.
 * Used to populate the doctor's "AI DermScan Verification" panel with an
 * accurate unread count and report list.
 *
 * Query params:
 *   status  — filter by deliveryStatus ('PENDING' | 'DELIVERED_TO_LEAD' | 'REVIEWED' | 'all')
 *             Defaults to 'DELIVERED_TO_LEAD' (unread reports only).
 */
router.get('/doctor/:doctorId', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const statusFilter = req.query.status || 'DELIVERED_TO_LEAD';

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(doctorId)) {
      const query = { leadDoctorId: doctorId };
      if (statusFilter !== 'all') {
        query.deliveryStatus = statusFilter;
      }

      const [dermScans, stressReports] = await Promise.all([
        DermScanReport.find(query).sort({ createdAt: -1 }).lean(),
        StressReport.find(query).sort({ createdAt: -1 }).lean(),
      ]);

      return res.json({
        success: true,
        unreadCount: dermScans.length + stressReports.length,
        dermScans,
        stressReports,
        source: 'mongodb',
      });
    }

    // Demo fallback: filter in-memory reports for this doctor
    const doctorReports = inMemoryReports.filter(
      (r) => r.leadDoctorId === doctorId && (statusFilter === 'all' || r.deliveryStatus === statusFilter)
    );

    return res.json({
      success:       true,
      unreadCount:   doctorReports.length,
      dermScans:     doctorReports.filter((r) => r.scanType !== undefined),
      stressReports: doctorReports.filter((r) => r.reportData?.cortisolRiskLevel !== undefined),
      source:        'demo',
    });

  } catch (error) {
    console.error('[reportRoutes] GET /doctor/:doctorId error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch reports.', error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/reports/:reportId/reviewed
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Marks a report as REVIEWED by the lead doctor.
 * Called when the doctor opens the AutoReportBanner drawer in their chat UI.
 *
 * Body: { reportType: 'DERMSCAN' | 'STRESS' }
 */
router.patch('/:reportId/reviewed', async (req, res) => {
  try {
    const { reportId } = req.params;
    const { reportType } = req.body;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(reportId)) {
      const Model = reportType === 'STRESS' ? StressReport : DermScanReport;
      const updated = await Model.findByIdAndUpdate(
        reportId,
        { deliveryStatus: 'REVIEWED', reviewedAt: new Date() },
        { new: true }
      ).lean();

      if (!updated) {
        return res.status(404).json({ success: false, message: 'Report not found.' });
      }

      return res.json({ success: true, report: updated, source: 'mongodb' });
    }

    // Demo fallback
    const idx = inMemoryReports.findIndex((r) => r._id === reportId || r.id === reportId);
    if (idx !== -1) {
      inMemoryReports[idx] = {
        ...inMemoryReports[idx],
        deliveryStatus: 'REVIEWED',
        reviewedAt: new Date().toISOString(),
      };
    }

    return res.json({ success: true, reportId, deliveryStatus: 'REVIEWED', source: 'demo' });

  } catch (error) {
    console.error('[reportRoutes] PATCH /:reportId/reviewed error:', error);
    return res.status(500).json({ success: false, message: 'Failed to mark report as reviewed.', error: error.message });
  }
});

export default router;
