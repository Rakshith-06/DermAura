import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { Patient, Doctor, User } from '../models/User.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'sih_dermaura_hackathon_secret_2026';
const JWT_EXPIRES_IN = '7d';

// In-Memory Database Fallback (used when local MongoDB server is not running)
const inMemoryUsers = [];

// Pre-seed demo accounts in Memory Store for instant hackathon demonstration
const seedDemoAccounts = async () => {
  const hashedPass = await bcrypt.hash('Password123!', 12);
  const demoPatientData = {
    fullName: 'Aarav Sharma (Demo Patient)',
    email: 'patient@dermaura.com',
    phone: '+919876543210',
    password: hashedPass,
    role: 'patient',
    age: 28,
    gender: 'Male',
    emergencyContact: { name: 'Ramesh Sharma', relationship: 'Father', phone: '+919876543211' },
    medicalHistory: { bloodGroup: 'O+', allergies: ['Penicillin'], chronicIllnesses: ['Asthma'] }
  };

  const demoDoctorData = {
    fullName: 'Dr. Sarah Jenkins (Demo Doctor)',
    email: 'doctor@dermaura.com',
    phone: '+919812345678',
    password: hashedPass,
    role: 'doctor',
    licenseNumber: 'MCI-98421-B',
    qualifications: 'MBBS, MD (Dermatology)',
    specialization: 'Dermatology',
    hospitalAffiliation: { name: 'AIIMS Hospital', address: 'New Delhi' },
    yearsOfExperience: 10,
    isVerified: true
  };

  if (inMemoryUsers.length === 0) {
    inMemoryUsers.push(
      { _id: 'demo-patient-001', ...demoPatientData },
      { _id: 'demo-doctor-002', ...demoDoctorData }
    );
  }

  // Seed MongoDB if connected and empty
  if (isMongoConnected()) {
    try {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        // Create Patient with plain password to trigger pre-save hash hook
        const mongoPatient = new Patient({
          ...demoPatientData,
          password: 'Password123!',
        });
        await mongoPatient.save();

        const mongoDoctor = new Doctor({
          ...demoDoctorData,
          password: 'Password123!',
        });
        await mongoDoctor.save();
        console.log('✅ Pre-seeded demo patient and doctor accounts into MongoDB.');
      }
    } catch (err) {
      console.warn('⚠️ Could not seed demo accounts into MongoDB:', err.message);
    }
  }
};

const isMongoConnected = () => mongoose.connection.readyState === 1;

// Attempt seeding on router init / DB connect
mongoose.connection.on('connected', () => {
  seedDemoAccounts();
});
seedDemoAccounts();

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id || user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

const formatUserResponse = (user) => {
  return {
    id: user._id || user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone || '',
    role: user.role,
    age: user.age,
    gender: user.gender,
    emergencyContact: user.emergencyContact,
    medicalHistory: user.medicalHistory,
    licenseNumber: user.licenseNumber,
    qualifications: user.qualifications,
    specialization: user.specialization,
    hospitalAffiliation: user.hospitalAffiliation,
    yearsOfExperience: user.yearsOfExperience,
    isVerified: user.isVerified ?? true,
  };
};

/**
 * @route   POST /api/auth/register/patient
 * @desc    Register Patient (MongoDB or Fallback Store)
 */
router.post('/register/patient', async (req, res) => {
  try {
    const { fullName, email, phone, password, age, gender, emergencyName, emergencyRelation, emergencyPhone, bloodGroup, allergies } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields (Full Name, Email, Password).' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
    }

    const sanitizedPhone = phone || '+919876543210';
    const parsedAge = parseInt(age, 10) || 25;
    const sanitizedAllergies = typeof allergies === 'string' 
      ? allergies.split(',').map((a) => a.trim()).filter(Boolean) 
      : Array.isArray(allergies) ? allergies : [];

    const emergencyObj = {
      name: emergencyName?.trim() || 'Family Contact',
      relationship: emergencyRelation?.trim() || 'Relative',
      phone: emergencyPhone?.trim() || sanitizedPhone,
    };

    if (isMongoConnected()) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
      }

      const patient = new Patient({
        fullName,
        email: email.toLowerCase(),
        phone: sanitizedPhone,
        password,
        age: parsedAge,
        gender: gender || 'Male',
        emergencyContact: emergencyObj,
        medicalHistory: {
          bloodGroup: bloodGroup || 'O+',
          allergies: sanitizedAllergies,
        },
      });

      await patient.save();
      const token = generateToken(patient);

      return res.status(201).json({
        success: true,
        message: 'Patient registered successfully in MongoDB!',
        token,
        user: formatUserResponse(patient),
      });
    } else {
      // In-Memory Fallback
      const existing = inMemoryUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const newPatient = {
        _id: `patient-${Date.now()}`,
        fullName,
        email: email.toLowerCase(),
        phone: sanitizedPhone,
        password: hashedPassword,
        role: 'patient',
        age: parsedAge,
        gender: gender || 'Male',
        emergencyContact: emergencyObj,
        medicalHistory: { bloodGroup: bloodGroup || 'O+', allergies: sanitizedAllergies }
      };

      inMemoryUsers.push(newPatient);
      const token = generateToken(newPatient);

      return res.status(201).json({
        success: true,
        message: 'Patient registered successfully (Demo Mode)!',
        token,
        user: formatUserResponse(newPatient),
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error during registration.' });
  }
});

/**
 * @route   POST /api/auth/register/doctor
 * @desc    Register Doctor (MongoDB or Fallback Store)
 */
router.post('/register/doctor', async (req, res) => {
  try {
    const { fullName, email, phone, password, licenseNumber, qualifications, specialization, hospitalName, experienceYears } = req.body;

    if (!email || !password || !fullName || !licenseNumber) {
      return res.status(400).json({ success: false, message: 'Please fill in all mandatory doctor details including License Number.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
    }

    const sanitizedPhone = phone || '+919812345678';
    const parsedExp = parseInt(experienceYears, 10) || 5;
    const cleanLicense = licenseNumber.toUpperCase().trim();

    if (isMongoConnected()) {
      const existingEmail = await User.findOne({ email: email.toLowerCase() });
      if (existingEmail) return res.status(400).json({ success: false, message: 'Email already registered.' });

      const existingLicense = await Doctor.findOne({ licenseNumber: cleanLicense });
      if (existingLicense) return res.status(400).json({ success: false, message: 'License number already registered.' });

      const doctor = new Doctor({
        fullName,
        email: email.toLowerCase(),
        phone: sanitizedPhone,
        password,
        licenseNumber: cleanLicense,
        qualifications: qualifications?.trim() || 'MBBS, MD (Dermatology)',
        specialization: specialization?.trim() || 'Dermatology',
        hospitalAffiliation: { name: hospitalName?.trim() || 'AIIMS / Metro Hospital', address: 'City Medical Hub' },
        yearsOfExperience: parsedExp,
        isVerified: true,
      });

      await doctor.save();
      const token = generateToken(doctor);

      return res.status(201).json({
        success: true,
        message: 'Doctor registered successfully in MongoDB!',
        token,
        user: formatUserResponse(doctor),
      });
    } else {
      // In-Memory Fallback
      const existing = inMemoryUsers.find((u) => u.email.toLowerCase() === email.toLowerCase() || u.licenseNumber?.toUpperCase() === cleanLicense);
      if (existing) return res.status(400).json({ success: false, message: 'Email or License Number already exists.' });

      const hashedPassword = await bcrypt.hash(password, 12);
      const newDoctor = {
        _id: `doctor-${Date.now()}`,
        fullName,
        email: email.toLowerCase(),
        phone: sanitizedPhone,
        password: hashedPassword,
        role: 'doctor',
        licenseNumber: cleanLicense,
        qualifications: qualifications?.trim() || 'MBBS, MD (Dermatology)',
        specialization: specialization?.trim() || 'Dermatology',
        hospitalAffiliation: { name: hospitalName?.trim() || 'City Hospital', address: 'City' },
        yearsOfExperience: parsedExp,
        isVerified: true
      };

      inMemoryUsers.push(newDoctor);
      const token = generateToken(newDoctor);

      return res.status(201).json({
        success: true,
        message: 'Doctor registered successfully (Demo Mode)!',
        token,
        user: formatUserResponse(newDoctor),
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error during doctor registration.' });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate Patient or Doctor and issue JWT token
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password, expectedRole } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
    }

    if (isMongoConnected()) {
      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials.' });
      }

      if (expectedRole && user.role !== expectedRole) {
        return res.status(403).json({
          success: false,
          message: `This account is registered as a ${user.role.toUpperCase()}. Please switch tabs to log in.`,
        });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials.' });
      }

      const token = generateToken(user);
      return res.status(200).json({
        success: true,
        message: 'Logged in successfully via MongoDB!',
        token,
        user: formatUserResponse(user),
      });
    } else {
      // In-Memory Fallback Authentication
      const user = inMemoryUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials.' });
      }

      if (expectedRole && user.role !== expectedRole) {
        return res.status(403).json({
          success: false,
          message: `This account is registered as a ${user.role.toUpperCase()}. Please switch tabs to log in.`,
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials.' });
      }

      const token = generateToken(user);
      return res.status(200).json({
        success: true,
        message: 'Logged in successfully (Demo Database)!',
        token,
        user: formatUserResponse(user),
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error during login.' });
  }
});

export default router;

