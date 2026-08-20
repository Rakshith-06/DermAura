import mongoose from 'mongoose';

/**
 * ── MedicationSchedule Schema ───────────────────────────────────────────────
 * Defines the recurring daily dose schedule generated upon prescription approval.
 */
const MedicationScheduleSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient ID is required'],
      index: true,
    },
    prescriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prescription',
      required: [true, 'Prescription ID is required'],
      index: true,
    },
    drugName: {
      type: String,
      required: [true, 'Drug name is required'],
      trim: true,
    },
    dosage: {
      type: String,
      required: [true, 'Dosage is required'],
      trim: true,
    },
    timeOfDay: {
      type: String,
      enum: ['Morning', 'Afternoon', 'Night'],
      required: true,
    },
    scheduledTime: {
      type: String, // e.g. "08:00 AM", "02:00 PM", "09:00 PM"
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * ── MedicationLog Schema ───────────────────────────────────────────────────
 * Tracks actual daily dose adherence ('TAKEN', 'SKIPPED', 'MISSED') & patient feedback.
 */
const MedicationLogSchema = new mongoose.Schema(
  {
    scheduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicationSchedule',
      required: [true, 'Schedule ID is required'],
      index: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient ID is required'],
      index: true,
    },
    prescriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prescription',
      required: [true, 'Prescription ID is required'],
      index: true,
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Scheduled dose date is required'],
      index: true,
    },
    timeOfDay: {
      type: String,
      enum: ['Morning', 'Afternoon', 'Night'],
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: ['TAKEN', 'SKIPPED', 'MISSED'],
        message: '{VALUE} is not a valid medication log status',
      },
      required: true,
      default: 'MISSED',
      index: true,
    },
    takenAt: {
      type: Date,
    },
    patientFeedback: {
      type: String,
      default: '',
      trim: true,
    },
    sideEffectSeverity: {
      type: String,
      enum: ['NONE', 'MILD', 'MODERATE', 'SEVERE'],
      default: 'NONE',
    },
  },
  {
    timestamps: true,
  }
);

// ── Compound Indexes for Fast Daily Adherence Queries ──────────────────────
MedicationLogSchema.index({ patientId: 1, scheduledDate: 1, timeOfDay: 1 }, { unique: true });
MedicationScheduleSchema.index({ patientId: 1, isActive: 1 });

export const MedicationSchedule = mongoose.model('MedicationSchedule', MedicationScheduleSchema);
export const MedicationLog = mongoose.model('MedicationLog', MedicationLogSchema);

export default {
  MedicationSchedule,
  MedicationLog,
};
