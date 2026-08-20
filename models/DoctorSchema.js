import mongoose from 'mongoose';

/**
 * Updated Doctor Schema — includes gender, languagesSpoken,
 * consultationFee, rating, and availability flags.
 */
const DoctorSchema = new mongoose.Schema({
  licenseNumber: {
    type: String,
    required: [true, 'Medical License/Registration Number is required'],
    unique: true,
    uppercase: true,
    trim: true,
  },
  qualifications: {
    type: String, // e.g. "MBBS, MD (Dermatology)"
    required: [true, 'Qualifications are required'],
    trim: true,
  },
  specialization: {
    type: String,
    required: [true, 'Specialization is required'],
    trim: true,
  },
  // ── NEW ──────────────────────────────────────
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
    required: [true, 'Gender is required'],
  },
  languagesSpoken: {
    type: [String], // e.g. ['English', 'Hindi', 'Gujarati']
    default: ['English'],
  },
  profilePictureUrl: {
    type: String,
    default: '',
  },
  consultationFee: {
    type: Number,
    default: 0, // ₹ — mocked for hackathon
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 4.5, // mocked for hackathon
  },
  isAvailableForPCP: {
    // Whether this doctor accepts new Primary Care patients
    type: Boolean,
    default: true,
  },
  // ─────────────────────────────────────────────
  hospitalAffiliation: {
    name: { type: String, required: true, trim: true },
    address: { type: String, default: '', trim: true },
  },
  yearsOfExperience: {
    type: Number,
    required: [true, 'Years of experience is required'],
    min: [0, 'Years of experience cannot be negative'],
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
});

export default DoctorSchema;
