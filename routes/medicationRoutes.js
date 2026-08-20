import express from 'express';
import { MedicationSchedule, MedicationLog } from '../models/MedicationSchedule.js';

const router = express.Router();

// Mock store for demo mode
const mockLogs = new Map();

/**
 * ────────────────────────────────────────────────────────────────────────────
 * PATCH /api/medications/log
 * ── Patient Logs Daily Dose Adherence ('TAKEN', 'SKIPPED', 'MISSED') ────────
 * ────────────────────────────────────────────────────────────────────────────
 */
router.patch('/log', async (req, res) => {
  try {
    const {
      scheduleId,
      patientId,
      prescriptionId,
      scheduledDate = new Date(),
      timeOfDay = 'Morning',
      status = 'TAKEN', // 'TAKEN' | 'SKIPPED' | 'MISSED'
      patientFeedback = '',
      sideEffectSeverity = 'NONE', // 'NONE' | 'MILD' | 'MODERATE' | 'SEVERE'
    } = req.body;

    // ── Input Validation ───────────────────────────────────────────────────
    if (!patientId) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'patientId is required',
      });
    }

    if (!['TAKEN', 'SKIPPED', 'MISSED'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: "status must be 'TAKEN', 'SKIPPED', or 'MISSED'",
      });
    }

    const todayDate = new Date(scheduledDate);
    todayDate.setHours(0, 0, 0, 0);

    let logDoc;

    try {
      logDoc = await MedicationLog.findOneAndUpdate(
        {
          patientId,
          ...(scheduleId ? { scheduleId } : {}),
          timeOfDay,
          scheduledDate: todayDate,
        },
        {
          patientId,
          scheduleId,
          prescriptionId,
          scheduledDate: todayDate,
          timeOfDay,
          status,
          takenAt: status === 'TAKEN' ? new Date() : null,
          patientFeedback: patientFeedback.trim(),
          sideEffectSeverity,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    } catch (dbErr) {
      // Mock Fallback for Demo API mode
      const mockKey = `${patientId}_${todayDate.toISOString().slice(0, 10)}_${timeOfDay}`;
      logDoc = {
        _id: `log-${Date.now()}`,
        patientId,
        scheduleId,
        prescriptionId,
        scheduledDate: todayDate,
        timeOfDay,
        status,
        takenAt: status === 'TAKEN' ? new Date() : null,
        patientFeedback: patientFeedback.trim(),
        sideEffectSeverity,
        updatedAt: new Date(),
      };
      mockLogs.set(mockKey, logDoc);
    }

    // Determine status badge message
    let statusMessage = '';
    if (status === 'TAKEN') {
      statusMessage = `Great job! ${timeOfDay} dose marked as TAKEN. Daily adherence logged.`;
    } else if (status === 'SKIPPED') {
      statusMessage = `${timeOfDay} dose marked as SKIPPED. Clinical note recorded.`;
    } else {
      statusMessage = `${timeOfDay} dose marked as MISSED. Reminders will update for next dose slot.`;
    }

    return res.status(200).json({
      success: true,
      message: statusMessage,
      medicationLog: logDoc,
    });
  } catch (err) {
    console.error('Error logging medication dose:', err);
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Failed to record medication dose log: ' + err.message,
    });
  }
});

/**
 * ────────────────────────────────────────────────────────────────────────────
 * GET /api/medications/patient/:patientId
 * ── Fetch Active Medication Schedules & Logs for Patient ────────────────────
 * ────────────────────────────────────────────────────────────────────────────
 */
router.get('/patient/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;

    let schedules = [];
    let logs = [];

    try {
      schedules = await MedicationSchedule.find({ patientId, isActive: true }).sort({ createdAt: -1 });
      logs = await MedicationLog.find({ patientId }).sort({ scheduledDate: -1 }).limit(30);
    } catch (dbErr) {
      logs = Array.from(mockLogs.values()).filter((l) => l.patientId === patientId);
    }

    return res.status(200).json({
      success: true,
      schedulesCount: schedules.length,
      schedules,
      logsCount: logs.length,
      logs,
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
