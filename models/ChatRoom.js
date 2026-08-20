import mongoose from 'mongoose';

const ChatRoomSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctorRole: {
      type: String,
      enum: ['LEAD_PRIMARY', 'SPECIALIST_REFERRED'],
      default: 'SPECIALIST_REFERRED',
      required: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE_LEAD', 'REFERRED_CONSULT', 'CLOSED_READ_ONLY'],
      default: 'REFERRED_CONSULT',
      required: true,
    },
    specializationTag: {
      type: String,
      default: 'Dermatology',
    },
    closureReason: {
      type: String,
      default: '',
    },
    closedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const ChatRoom = mongoose.model('ChatRoom', ChatRoomSchema);
export default ChatRoom;
