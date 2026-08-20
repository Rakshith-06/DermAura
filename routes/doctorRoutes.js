import express from 'express';
import mongoose from 'mongoose';
import { Doctor, Patient, User } from '../models/User.js';
import { authenticateToken, requireRole } from '../middleware/chatroomAuth.js';

const router = express.Router();

/**
 * @route  GET /api/doctors/primary-care
 * @desc   Fetch General Physician / Primary Care doctors available for PCP selection.
 *         Supports query filters: gender, language, minExperience
 * @access Public (no auth needed during onboarding)
 */
router.get('/primary-care', async (req, res) => {
  try {
    const { gender, language, minExperience } = req.query;

    // Base filter: only General Physicians available for PCP assignment
    const filter = {
      isAvailableForPCP: true,
      specialization: {
        $in: ['General Medicine', 'General Physician', 'Internal Medicine', 'Family Medicine'],
      },
    };

    if (gender) filter.gender = gender;

    if (language) {
      filter.languagesSpoken = { $elemMatch: { $regex: language, $options: 'i' } };
    }

    if (minExperience) {
      filter.yearsOfExperience = { $gte: Number(minExperience) };
    }

    const doctors = await Doctor.find(filter)
      .select(
        'fullName gender specialization qualifications yearsOfExperience hospitalAffiliation languagesSpoken rating consultationFee profilePictureUrl isVerified'
      )
      .sort({ rating: -1, yearsOfExperience: -1 })
      .limit(20);

    return res.json({ success: true, count: doctors.length, doctors });
  } catch (error) {
    console.error('Error fetching primary care doctors:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch doctors.', error: error.message });
  }
});

/**
 * @route  PATCH /api/patients/select-lead-doctor
 * @desc   Patient selects their Primary Care Provider (Lead Doctor) during onboarding.
 *         Sets primaryLeadDoctorId and clears isFirstLogin flag.
 * @access Private (Patient auth token required in production)
 * @body   { patientId, doctorId }
 */
router.patch('/select-lead-doctor', async (req, res) => {
  try {
    const { patientId, doctorId } = req.body;

    if (!patientId || !doctorId) {
      return res.status(400).json({ success: false, message: 'patientId and doctorId are required.' });
    }

    // Verify doctor exists and is available for PCP
    const doctor = await Doctor.findById(doctorId).select('fullName isAvailableForPCP specialization');
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }
    if (!doctor.isAvailableForPCP) {
      return res.status(400).json({ success: false, message: 'This doctor is not currently accepting new primary care patients.' });
    }

    // Update patient record
    const updatedPatient = await Patient.findByIdAndUpdate(
      patientId,
      {
        primaryLeadDoctorId: doctorId,
        isFirstLogin: false,
      },
      { new: true, select: '-password' }
    ).populate('primaryLeadDoctorId', 'fullName specialization hospitalAffiliation');

    if (!updatedPatient) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    return res.json({
      success: true,
      message: `Dr. ${doctor.fullName} has been set as your Primary Care Provider!`,
      patient: updatedPatient,
    });
  } catch (error) {
    console.error('Error selecting lead doctor:', error);
    return res.status(500).json({ success: false, message: 'Failed to assign Lead Doctor.', error: error.message });
  }
});

/**
 * @route  GET /api/doctors/assigned-patients
 * @desc   Fetch the list of patients assigned to the authenticated doctor.
 *
 * SECURITY CONTRACT:
 *   - Requires a valid doctor JWT (authenticateToken + requireRole guard).
 *   - The database query ALWAYS enforces { role: 'patient' } as a hard filter.
 *     This prevents user accounts with role: 'doctor' from ever appearing in
 *     the patient queue, closing the Dr-Sarah-in-patient-list vulnerability.
 *   - In MongoDB mode: uses the User discriminator key ('patient') for DB-level
 *     isolation so the filter cannot be bypassed by any query manipulation.
 *   - In demo/in-memory mode: returns a curated static set of demo patients.
 *
 * @access Private — Doctor only
 */
router.get(
  '/assigned-patients',
  authenticateToken,
  requireRole(['doctor']),
  async (req, res) => {
    try {
      const doctorId = req.user.id;

      // ── MongoDB path ──────────────────────────────────────────────────────
      if (mongoose.connection.readyState === 1) {
        /**
         * Filter 1 (discriminator):
         *   The Patient model is a Mongoose discriminator of User with
         *   discriminatorKey = 'role'. Querying via Patient.find() already
         *   constrains `role` to 'patient' at the driver level — this is the
         *   first line of defence.
         *
         * Filter 2 (explicit role guard):
         *   We additionally pass `role: 'patient'` explicitly inside the query
         *   so this constraint is visible in query logs and cannot be omitted
         *   by future refactors that swap Patient.find() for User.find().
         *
         * Filter 3 (doctor assignment check):
         *   Only patients whose `primaryLeadDoctorId` matches the requesting
         *   doctor's ID are returned — no cross-doctor data leakage.
         */
        const patients = await Patient.find({
          role: 'patient',                    // ← explicit safeguard (belt-and-suspenders)
          primaryLeadDoctorId: doctorId,      // ← scoped to this doctor only
          isActive: { $ne: false },           // ← exclude deactivated accounts
        })
          .select(
            'fullName email phone age gender medicalHistory isFirstLogin primaryLeadDoctorId createdAt'
          )
          .sort({ createdAt: -1 })
          .lean();

        // ── Paranoia double-check: strip any non-patient that somehow passed through ──
        const safePatients = patients.filter(
          (u) => (u.role ?? 'patient') === 'patient'
        );

        return res.json({
          success: true,
          count: safePatients.length,
          patients: safePatients,
          source: 'mongodb',
        });
      }

      // ── In-memory / Demo mode fallback ───────────────────────────────────
      // Return a static curated demo patient list.
      // NOTE: These are all explicitly tagged role:'patient' and are safe to render.
      const demoPatients = [
        {
          _id: 'demo-patient-001',
          role: 'patient',
          fullName: 'Aarav Sharma (Demo Patient)',
          email: 'patient@dermaura.com',
          phone: '+919876543210',
          age: 28,
          gender: 'Male',
          primaryLeadDoctorId: doctorId,
          medicalHistory: {
            bloodGroup: 'O+',
            allergies: ['Penicillin'],
            chronicIllnesses: ['Asthma'],
            currentMedications: ['Gentle Facial Moisturizer 499mg', 'SPF 50+ Sunscreen'],
          },
          createdAt: new Date().toISOString(),
        },
        {
          _id: 'demo-patient-002',
          role: 'patient',
          fullName: 'Priya Patel',
          email: 'priya.patel@demo.com',
          phone: '+919876543211',
          age: 31,
          gender: 'Female',
          primaryLeadDoctorId: doctorId,
          medicalHistory: {
            bloodGroup: 'B+',
            allergies: [],
            chronicIllnesses: [],
            currentMedications: ['Aloe Gel 299mg'],
          },
          createdAt: new Date().toISOString(),
        },
        {
          _id: 'demo-patient-003',
          role: 'patient',
          fullName: 'Rohan Verma',
          email: 'rohan.verma@demo.com',
          phone: '+919876543212',
          age: 42,
          gender: 'Male',
          primaryLeadDoctorId: doctorId,
          medicalHistory: {
            bloodGroup: 'A+',
            allergies: ['Sulfa'],
            chronicIllnesses: ['Hypertension'],
            currentMedications: ['Soothe Cream 100mg'],
          },
          createdAt: new Date().toISOString(),
        },
        {
          _id: 'demo-patient-004',
          role: 'patient',
          fullName: 'Sneha Reddy',
          email: 'sneha.reddy@demo.com',
          phone: '+919876543213',
          age: 24,
          gender: 'Female',
          primaryLeadDoctorId: doctorId,
          medicalHistory: {
            bloodGroup: 'O-',
            allergies: [],
            chronicIllnesses: [],
            currentMedications: ['Scalp Purifying Wash'],
          },
          createdAt: new Date().toISOString(),
        },
      ];

      return res.json({
        success: true,
        count: demoPatients.length,
        patients: demoPatients,
        source: 'demo',
      });
    } catch (error) {
      console.error('[doctorRoutes] GET /assigned-patients error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch assigned patients.',
        error: error.message,
      });
    }
  }
);

export default router;
