import mongoose from 'mongoose';

/**
 * ── TransferLog Subdocument Schema ──────────────────────────────────────────
 * Tracks doctor handoffs for multi-day treatments or specialist escalations.
 */
const TransferLogSchema = new mongoose.Schema(
  {
    fromDoctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    toDoctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    transferredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    transferredAt: {
      type: Date,
      default: Date.now,
    },
    reason: {
      type: String,
      required: [true, 'Transfer rationale is required for clinical safety'],
      trim: true,
    },
  },
  { _id: true }
);

/**
 * ── PhotoAttachment Subdocument Schema ──────────────────────────────────────
 * Stores patient image uploads for skin/hair condition analysis.
 */
const PhotoAttachmentSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },
    caption: {
      type: String,
      default: '',
      trim: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

/**
 * ── Consultation Schema ─────────────────────────────────────────────────────
 * Supports both 24-hr ONE_TIME_SUGGESTION sessions and escrowed MULTI_DAY_TREATMENT plans.
 */
const ConsultationSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient ID is required'],
      index: true,
    },
    leadDoctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Lead Primary Doctor (PCP) is required'],
      index: true,
    },
    assignedDoctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Currently assigned attending doctor is required'],
      index: true,
    },
    type: {
      type: String,
      enum: {
        values: ['ONE_TIME_SUGGESTION', 'MULTI_DAY_TREATMENT'],
        message: '{VALUE} is not a valid consultation type',
      },
      required: [true, 'Consultation type is required'],
      default: 'ONE_TIME_SUGGESTION',
    },
    status: {
      type: String,
      enum: {
        values: ['REQUESTED', 'ACCEPTED', 'ACTIVE', 'COMPLETED', 'CLOSED_READ_ONLY'],
        message: '{VALUE} is not a valid consultation status',
      },
      default: 'REQUESTED',
      index: true,
    },
    skinType: {
      type: String,
      enum: ['Dry', 'Oily', 'Combination', 'Sensitive', 'Normal', 'Scalp - Flaky', 'Scalp - Oily', 'Unspecified'],
      default: 'Unspecified',
    },
    photos: [PhotoAttachmentSchema],
    chiefComplaint: {
      type: String,
      required: [true, 'Chief complaint is required'],
      trim: true,
    },

    // ── 24-Hour Session Expiration (for ONE_TIME_SUGGESTION) ────────────────
    expiresAt: {
      type: Date,
      default: function () {
        if (this.type === 'ONE_TIME_SUGGESTION') {
          return new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from creation
        }
        return null;
      },
      index: true,
    },

    // ── Multi-Day Treatment & Escrow Fields ─────────────────────────────────
    totalDays: {
      type: Number,
      min: [1, 'Total treatment days must be at least 1'],
      default: 1,
    },
    totalAmount: {
      type: Number,
      min: [0, 'Total amount cannot be negative'],
      default: 0, // In INR ₹
    },
    dailyRate: {
      type: Number,
      min: [0, 'Daily rate cannot be negative'],
      default: 0, // In INR ₹
    },
    escrowRemaining: {
      type: Number,
      min: [0, 'Escrow balance cannot be negative'],
      default: 0, // In INR ₹
    },
    handoffNotes: {
      type: String,
      default: '',
      trim: true,
    },
    transferLogs: [TransferLogSchema],
  },
  {
    timestamps: true,
  }
);

// ── Indexes for Fast Lookups ────────────────────────────────────────────────
ConsultationSchema.index({ patientId: 1, status: 1 });
ConsultationSchema.index({ assignedDoctorId: 1, status: 1 });

// ── Virtual: Is Expired Check ───────────────────────────────────────────────
ConsultationSchema.virtual('isExpired').get(function () {
  if (!this.expiresAt) return false;
  return Date.now() > this.expiresAt.getTime();
});

// ── Method: Release Daily Escrow Amount ────────────────────────────────────
ConsultationSchema.methods.releaseDailyEscrow = async function () {
  if (this.type !== 'MULTI_DAY_TREATMENT' || this.escrowRemaining <= 0) {
    throw new Error('No escrow balance available to release');
  }
  const amountToRelease = Math.min(this.dailyRate, this.escrowRemaining);
  this.escrowRemaining -= amountToRelease;
  if (this.escrowRemaining === 0) {
    this.status = 'COMPLETED';
  }
  return await this.save();
};

const Consultation = mongoose.model('Consultation', ConsultationSchema);
export default Consultation;
