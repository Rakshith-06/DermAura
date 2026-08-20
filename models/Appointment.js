import mongoose from 'mongoose';

/**
 * ── Doctor Details Subdocument Schema ───────────────────────────────────────
 * Snapshot of attending doctor details for historical consistency.
 */
const DoctorSnapshotSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    specialization: { type: String, required: true, trim: true },
    hospital: { type: String, default: 'DermAura Tele-Health Network', trim: true },
    photo: { type: String, default: '👩‍⚕️' },
  },
  { _id: false }
);

/**
 * ── Appointment Schema ──────────────────────────────────────────────────────
 * Manages scheduled tele-consultations, video links, alerts, and statuses.
 */
const AppointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient ID is required'],
      index: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Doctor ID is required'],
      index: true,
    },
    consultationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Consultation',
      index: true,
    },
    doctorDetails: {
      type: DoctorSnapshotSchema,
      required: true,
    },
    scheduledAt: {
      type: Date,
      required: [true, 'Scheduled appointment date & time is required'],
      index: true,
    },
    slotTime: {
      type: String, // e.g. "10:30 AM", "03:00 PM"
      required: [true, 'Slot time string is required'],
    },
    meetLink: {
      type: String, // e.g. "https://meet.dermaura.com/room-88219"
      default: function () {
        return `https://meet.dermaura.com/room-${Math.floor(100000 + Math.random() * 900000)}`;
      },
    },
    status: {
      type: String,
      enum: {
        values: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
        message: '{VALUE} is not a valid appointment status',
      },
      default: 'SCHEDULED',
      index: true,
    },
    alertTimingMinutesBefore: {
      type: Number,
      default: 15, // Trigger reminder 15 mins before
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
    cancellationReason: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// ── Compound Indexes for Doctor & Patient Agenda Queries ───────────────────
AppointmentSchema.index({ patientId: 1, scheduledAt: 1 });
AppointmentSchema.index({ doctorId: 1, scheduledAt: 1 });
AppointmentSchema.index({ status: 1, scheduledAt: 1 });

const Appointment = mongoose.model('Appointment', AppointmentSchema);
export default Appointment;
