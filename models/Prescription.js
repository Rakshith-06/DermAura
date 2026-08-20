import mongoose from 'mongoose';

/**
 * ── Medication Item Subdocument Schema ──────────────────────────────────────
 * Defines individual prescribed drugs within a Lead/Specialist prescription.
 */
const MedicationItemSchema = new mongoose.Schema(
  {
    drugName: {
      type: String,
      required: [true, 'Drug name is required'],
      trim: true,
    },
    dosage: {
      type: String,
      required: [true, 'Dosage is required (e.g. 500mg or 1ml)'],
      trim: true,
    },
    timing: {
      type: [{
        type: String,
        enum: ['Morning', 'Afternoon', 'Night'],
      }],
      required: [true, 'At least one timing slot (Morning/Afternoon/Night) is required'],
      validate: [
        (val) => Array.isArray(val) && val.length > 0,
        'Timing must contain at least one dose slot',
      ],
    },
    durationDays: {
      type: Number,
      required: [true, 'Duration in days is required'],
      min: [1, 'Duration must be at least 1 day'],
    },
    instructions: {
      type: String,
      default: 'Take as directed by physician',
      trim: true,
    },
    isGatedProduct: {
      type: Boolean,
      default: true,
    },
    productId: {
      type: String,
      default: '',
    },
  },
  { _id: true }
);

/**
 * ── Prescription Schema ─────────────────────────────────────────────────────
 * Specialist proposals require Lead PCP gatekeeper approval to finalize.
 */
const PrescriptionSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient ID is required'],
      index: true,
    },
    authoringDoctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Authoring Doctor ID is required'],
      index: true,
    },
    leadDoctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Lead Doctor ID (Gatekeeper) is required'],
      index: true,
    },
    consultationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Consultation',
      index: true,
    },
    chatRoomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChatRoom',
    },
    medications: {
      type: [MedicationItemSchema],
      validate: [
        (val) => Array.isArray(val) && val.length > 0,
        'Prescription must contain at least one medication',
      ],
    },
    status: {
      type: String,
      enum: {
        values: ['PROPOSED', 'APPROVED', 'REJECTED'],
        message: '{VALUE} is not a valid prescription status',
      },
      default: 'PROPOSED',
      required: true,
      index: true,
    },
    clinicalRationale: {
      type: String,
      default: '',
      trim: true,
    },
    rejectionReason: {
      type: String,
      default: '',
      trim: true,
    },
    leadDoctorNotes: {
      type: String,
      default: '',
      trim: true,
    },
    approvedAt: {
      type: Date,
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// ── Alias for backwards compatibility with prescribingDoctorId ─────────────
PrescriptionSchema.virtual('prescribingDoctorId').get(function () {
  return this.authoringDoctorId;
});

// ── Compound Indexes for Fast Doctor & Patient Queries ──────────────────────
PrescriptionSchema.index({ patientId: 1, status: 1 });
PrescriptionSchema.index({ leadDoctorId: 1, status: 1 });
PrescriptionSchema.index({ authoringDoctorId: 1, status: 1 });

const Prescription = mongoose.model('Prescription', PrescriptionSchema);
export default Prescription;
