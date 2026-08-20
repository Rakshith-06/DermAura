import mongoose from 'mongoose';

/**
 * ── StressReport Schema ─────────────────────────────────────────────────────
 * Persists every Stress Analyzer / Cortisol Assessment completed by a patient.
 *
 * Mirrors the DermScanReport pattern:
 *   • `leadDoctorId` auto-populated from patient.primaryLeadDoctorId.
 *   • `deliveryStatus` tracks PENDING → DELIVERED_TO_LEAD → REVIEWED.
 *   • `reportData` stores the full quiz result from Dashboard.jsx's
 *     handleCalculateStressScore() output.
 */
const StressReportSchema = new mongoose.Schema(
  {
    // ── Patient who completed the stress quiz ─────────────────────────────────
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'patientId is required'],
      index: true,
    },

    // ── Lead doctor auto-populated from patient.primaryLeadDoctorId ──────────
    leadDoctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'leadDoctorId is required'],
      index: true,
    },

    // ── Full stress assessment result payload ─────────────────────────────────
    reportData: {
      score:           { type: Number, default: 0 },
      maxPts:          { type: Number, default: 20 },
      percentage:      { type: Number, default: 0 },       // 0-100
      category:        { type: String, default: '' },      // "High Cortisol Flare Risk…"
      summary:         { type: String, default: '' },
      recommendations: [{ type: String, trim: true }],

      // Detailed per-question breakdown
      detailedAnswers: [
        {
          id:             { type: String },
          question:       { type: String },
          selectedOption: { type: String },
          pts:            { type: Number },
        },
      ],

      // Derived clinical indicators for doctor's diagnostic panel
      cortisolRiskLevel: {
        type: String,
        enum: ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'],
        default: 'LOW',
      },
      hrvIndicator: {
        type: String,
        default: 'Normal',  // "Reduced HRV detected" | "Normal" | "Severely Reduced"
      },
      skinStressCorrelation: {
        type: String,
        default: 'Low correlation',
      },
    },

    // ── Delivery lifecycle ─────────────────────────────────────────────────────
    deliveryStatus: {
      type: String,
      enum: {
        values: ['PENDING', 'DELIVERED_TO_LEAD', 'REVIEWED'],
        message: '{VALUE} is not a valid delivery status',
      },
      default: 'PENDING',
      index: true,
    },

    deliveredAt: { type: Date },
    reviewedAt:  { type: Date },

    // ── Optional consultation linkage ─────────────────────────────────────────
    consultationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Consultation',
      default: null,
    },

    // ── Human-readable patient snapshot ───────────────────────────────────────
    patientSnapshot: {
      fullName: { type: String, default: '' },
      age:      { type: Number, default: 0 },
      gender:   { type: String, default: '' },
    },
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
StressReportSchema.index({ leadDoctorId: 1, deliveryStatus: 1, createdAt: -1 });
StressReportSchema.index({ patientId: 1, createdAt: -1 });

const StressReport = mongoose.model('StressReport', StressReportSchema);
export default StressReport;
