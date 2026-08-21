import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Base User Schema options
const options = {
  discriminatorKey: 'role', // 'patient' or 'doctor'
  timestamps: true,
};

const BaseUserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
    },
    phone: {
      type: String,
      required: [true, 'Contact number is required'],
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false, // Do not return password by default in queries
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  options
);

// Password Hashing Pre-save Hook
BaseUserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare entered password with hashed password
BaseUserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', BaseUserSchema);

// Category-Specific Lead Doctor Subdocument Schema
const LeadDoctorAssignmentSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: {
        values: ['SKIN_CARE', 'HAIR_CARE', 'GENERAL_HEALTH'],
        message: '{VALUE} is not a valid clinical lead doctor category.',
      },
      required: [true, 'Clinical category is required for lead doctor assignment.'],
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Doctor reference is required.'],
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'TRANSFERRED', 'ARCHIVED'],
      default: 'ACTIVE',
    },
  },
  { _id: true }
);

// Patient Discriminator Schema
const PatientSchema = new mongoose.Schema({
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [0, 'Age cannot be negative'],
    max: [120, 'Please enter a valid age'],
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
    required: [true, 'Gender selection is required'],
  },
  emergencyContact: {
    name: { type: String, required: true, trim: true },
    relationship: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
  },
  // Category-Specific Lead Doctors Array
  leadDoctors: {
    type: [LeadDoctorAssignmentSchema],
    default: [],
  },
  // Legacy / fallback reference
  primaryLeadDoctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  // First-login detector: triggers Lead Doctor selection onboarding flow
  isFirstLogin: {
    type: Boolean,
    default: true,
  },
  medicalHistory: {
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
      default: 'Unknown',
    },
    allergies: [{ type: String, trim: true }],
    chronicIllnesses: [{ type: String, trim: true }],
    pastSurgeries: [{ type: String, trim: true }],
    currentMedications: [{ type: String, trim: true }],
  },
});

// Helper Method: Get active lead doctor for a category
PatientSchema.methods.getActiveLeadDoctor = function (category) {
  const match = this.leadDoctors?.find(
    (ld) => ld.category === category && ld.status === 'ACTIVE'
  );
  return match ? match.doctorId : this.primaryLeadDoctorId || null;
};

// Helper Method: Assign or replace a lead doctor for a specific category
PatientSchema.methods.assignLeadDoctor = function (category, doctorId) {
  if (!this.leadDoctors) this.leadDoctors = [];
  
  // Mark any existing active doctor for this category as transferred
  this.leadDoctors.forEach((ld) => {
    if (ld.category === category && ld.status === 'ACTIVE') {
      ld.status = 'TRANSFERRED';
    }
  });

  this.leadDoctors.push({
    category,
    doctorId,
    assignedAt: new Date(),
    status: 'ACTIVE',
  });

  // Keep primaryLeadDoctorId synced for backward compatibility (defaults to SKIN_CARE or first assigned)
  if (category === 'SKIN_CARE' || !this.primaryLeadDoctorId) {
    this.primaryLeadDoctorId = doctorId;
  }

  this.isFirstLogin = false;
};

// Helper Method: Bulk assign category lead doctors
PatientSchema.methods.assignMultipleLeadDoctors = function (assignments = []) {
  assignments.forEach(({ category, doctorId }) => {
    if (category && doctorId) {
      this.assignLeadDoctor(category, doctorId);
    }
  });
};

// Doctor Discriminator Schema
const DoctorSchema = new mongoose.Schema({
  licenseNumber: {
    type: String,
    required: [true, 'Medical License/Registration Number is required'],
    unique: true,
    uppercase: true,
    trim: true,
  },
  qualifications: {
    type: String, // e.g., "MBBS, MD (Dermatology)"
    required: [true, 'Qualifications are required'],
    trim: true,
  },
  specialization: {
    type: String,
    required: [true, 'Specialization is required'],
    trim: true,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
    required: [true, 'Gender is required'],
  },
  languagesSpoken: {
    type: [String],
    default: ['English'],
  },
  profilePictureUrl: {
    type: String,
    default: '',
  },
  consultationFee: {
    type: Number,
    default: 0,
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 4.5,
  },
  isAvailableForPCP: {
    type: Boolean,
    default: true,
  },
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

const Patient = User.discriminator('patient', PatientSchema);
const Doctor = User.discriminator('doctor', DoctorSchema);

export { User, Patient, Doctor };
