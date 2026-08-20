import mongoose from 'mongoose';

/**
 * ── Notification Schema ─────────────────────────────────────────────────────
 * Manages system alerts, prescription workflow notifications, and appointment reminders.
 */
const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient user ID is required'],
      index: true,
    },
    userRole: {
      type: String,
      enum: ['PATIENT', 'DOCTOR', 'LEAD_DOCTOR'],
      required: true,
      default: 'PATIENT',
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: {
        values: [
          'PRESCRIPTION_PROPOSAL',
          'PRESCRIPTION_APPROVAL',
          'PRESCRIPTION_REJECTION',
          'UNLOCK_REQUEST',
          'APPOINTMENT_REMINDER',
          'CONSULTATION_TRANSFER',
          'MEDICATION_REMINDER',
          'GENERAL',
        ],
        message: '{VALUE} is not a valid notification type',
      },
      default: 'GENERAL',
      index: true,
    },
    actionUrl: {
      type: String,
      default: '',
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
    },
    alertTiming: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// ── Compound Index for Unread User Alerts ──────────────────────────────────
NotificationSchema.index({ userId: 1, isRead: 1, alertTiming: -1 });

const Notification = mongoose.model('Notification', NotificationSchema);
export default Notification;
