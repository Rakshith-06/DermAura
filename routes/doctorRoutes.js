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
 * @route  PATCH /api/patients/assign-category-lead-doctors
 * @desc   Assign or switch category-specific Lead Doctors for a patient (SKIN_CARE, HAIR_CARE, GENERAL_HEALTH)
 * @access Private/Public
 * @body   { patientId, assignments: [{ category: 'SKIN_CARE', doctorId: '...' }] } OR { patientId, category, doctorId }
 */
router.patch('/assign-category-lead-doctors', async (req, res) => {
  try {
    const { patientId, category, doctorId, assignments } = req.body;
    const targetPatientId = patientId || req.user?.id;

    if (!targetPatientId) {
      return res.status(400).json({ success: false, message: 'patientId is required.' });
    }

    const patient = await Patient.findById(targetPatientId);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    const assignmentList = Array.isArray(assignments) && assignments.length > 0
      ? assignments
      : (category && doctorId ? [{ category, doctorId }] : []);

    if (assignmentList.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Must provide either assignments array or single category and doctorId.',
      });
    }

    // Process each category assignment
    for (const item of assignmentList) {
      const validCategories = ['SKIN_CARE', 'HAIR_CARE', 'GENERAL_HEALTH'];
      if (!validCategories.includes(item.category)) {
        return res.status(400).json({
          success: false,
          message: `Invalid category ${item.category}. Must be one of ${validCategories.join(', ')}`,
        });
      }

      // Check doctor existence
      const doctor = await Doctor.findById(item.doctorId).select('fullName isAvailableForPCP');
      if (!doctor) {
        return res.status(404).json({ success: false, message: `Doctor ${item.doctorId} not found.` });
      }

      patient.assignLeadDoctor(item.category, item.doctorId);
    }

    await patient.save();

    const updatedPatient = await Patient.findById(targetPatientId)
      .populate('leadDoctors.doctorId', 'fullName specialization qualifications hospitalAffiliation')
      .populate('primaryLeadDoctorId', 'fullName specialization');

    return res.json({
      success: true,
      message: 'Category Lead Doctors assigned successfully!',
      patient: updatedPatient,
      leadDoctors: updatedPatient.leadDoctors,
    });
  } catch (error) {
    console.error('Error assigning category lead doctors:', error);
    return res.status(500).json({ success: false, message: 'Failed to assign Category Lead Doctors.', error: error.message });
  }
});

/**
 * @route  PATCH /api/patients/select-lead-doctor
 * @desc   Patient selects their Primary Care Provider (Lead Doctor) during onboarding.
 *         Sets primaryLeadDoctorId, populates leadDoctors, and clears isFirstLogin flag.
 * @access Private (Patient auth token required in production)
 * @body   { patientId, doctorId, category }
 */
router.patch('/select-lead-doctor', async (req, res) => {
  try {
    const { patientId, doctorId, category = 'SKIN_CARE' } = req.body;

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

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    // Use method to populate category
    patient.assignLeadDoctor(category, doctorId);
    patient.primaryLeadDoctorId = doctorId;
    patient.isFirstLogin = false;
    await patient.save();

    const updatedPatient = await Patient.findById(patientId)
      .populate('leadDoctors.doctorId', 'fullName specialization hospitalAffiliation')
      .populate('primaryLeadDoctorId', 'fullName specialization hospitalAffiliation');

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
 * @desc   Fetch the list of patients assigned to the authenticated doctor across any category.
 * @access Private — Doctor only
 */
router.get(
  '/assigned-patients',
  authenticateToken,
  requireRole(['doctor']),
  async (req, res) => {
    try {
      const doctorId = req.user.id;
      const { category } = req.query; // optional category filter

      // ── MongoDB path ──────────────────────────────────────────────────────
      if (mongoose.connection.readyState === 1) {
        const queryFilter = {
          role: 'patient',
          isActive: { $ne: false },
          $or: [
            { primaryLeadDoctorId: doctorId },
            {
              leadDoctors: {
                $elemMatch: {
                  doctorId: new mongoose.Types.ObjectId(doctorId),
                  status: 'ACTIVE',
                  ...(category ? { category } : {}),
                },
              },
            },
          ],
        };

        const patients = await Patient.find(queryFilter)
          .select(
            'fullName email phone age gender medicalHistory isFirstLogin leadDoctors primaryLeadDoctorId createdAt'
          )
          .populate('leadDoctors.doctorId', 'fullName specialization')
          .sort({ createdAt: -1 })
          .lean();

        const safePatients = patients.map((pt) => {
          // Identify categories where this doctor is active lead
          const assignedCategories = (pt.leadDoctors || [])
            .filter((ld) => String(ld.doctorId?._id || ld.doctorId) === String(doctorId) && ld.status === 'ACTIVE')
            .map((ld) => ld.category);

          // If assigned via legacy primaryLeadDoctorId with no category, default to SKIN_CARE
          if (assignedCategories.length === 0 && String(pt.primaryLeadDoctorId) === String(doctorId)) {
            assignedCategories.push('SKIN_CARE');
          }

          return {
            ...pt,
            assignedCategories,
          };
        });

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
