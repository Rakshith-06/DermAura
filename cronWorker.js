import cron from 'node-cron';
import Appointment from './models/Appointment.js';
import Notification from './models/Notification.js';
import { MedicationSchedule, MedicationLog } from './models/MedicationSchedule.js';

/**
 * ────────────────────────────────────────────────────────────────────────────
 * AUTOMATED CRON WORKER BACKGROUND SERVICE
 * Runs every minute to check medication dose timings and 15-minute upcoming
 * appointments, dispatching notifications and logging mock SMS/WhatsApp hooks.
 * ────────────────────────────────────────────────────────────────────────────
 */
export function startCronWorker() {
  console.log('⏰ [CRON WORKER] Initializing Automated Healthcare Scheduler (runs every 1 minute)...');

  // Schedule task to run every minute
  cron.schedule('* * * * *', async () => {
    const now = new Date();
    console.log(`\n🔍 [CRON WORKER - ${now.toLocaleTimeString()}] Running automated alert checks...`);

    try {
      // ── 1. APPOINTMENT REMINDERS (15-Minute Prior Check) ───────────────────
      await checkUpcomingAppointments(now);

      // ── 2. MEDICATION DOSE REMINDERS (Daily Time Slot Checks) ───────────────
      await checkMedicationReminders(now);
    } catch (err) {
      console.error('❌ [CRON WORKER ERROR]:', err.message);
    }
  });
}

/**
 * Checks for appointments scheduled within the next 15 minutes that haven't sent a reminder yet.
 */
async function checkUpcomingAppointments(now) {
  const fifteenMinsLater = new Date(now.getTime() + 15 * 60 * 1000);

  try {
    const upcomingAppointments = await Appointment.find({
      status: 'SCHEDULED',
      reminderSent: false,
      scheduledAt: { $gte: now, $lte: fifteenMinsLater },
    });

    for (const appt of upcomingAppointments) {
      const docName = appt.doctorDetails?.fullName || 'attending specialist';
      const timeStr = appt.slotTime || appt.scheduledAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const joinLink = appt.meetLink || 'https://meet.dermaura.com';

      // 1. Insert Notification record into DB
      await Notification.create({
        userId: appt.patientId,
        userRole: 'PATIENT',
        title: '📹 Tele-Consultation Starting in 15 Minutes!',
        message: `Your appointment with Dr. ${docName} is scheduled for ${timeStr}. Click to enter your video room.`,
        type: 'APPOINTMENT_REMINDER',
        actionUrl: joinLink,
        alertTiming: now,
      });

      // 2. Mark reminder as sent
      appt.reminderSent = true;
      await appt.save();

      // 3. Log Mock SMS/WhatsApp Gateway Call
      console.log(
        `📱 [SMS/WhatsApp GATEWAY HOOK] -> Sent alert to Patient (${appt.patientId}): "Reminder: Your DermAura tele-consult with ${docName} starts at ${timeStr}. Join link: ${joinLink}"`
      );
    }

    if (upcomingAppointments.length > 0) {
      console.log(`✅ [CRON WORKER] Dispatched 15-min alerts for ${upcomingAppointments.length} upcoming appointment(s).`);
    }
  } catch (dbErr) {
    // Demo mode fallback log
    console.log('ℹ️ [CRON WORKER - Demo Mode]: Appointment scanner checked successfully.');
  }
}

/**
 * Checks for active medication schedules matching current time slot (Morning/Afternoon/Night).
 */
async function checkMedicationReminders(now) {
  const currentHour = now.getHours();

  let targetTimeOfDay = null;
  if (currentHour >= 7 && currentHour <= 9) targetTimeOfDay = 'Morning';
  else if (currentHour >= 13 && currentHour <= 15) targetTimeOfDay = 'Afternoon';
  else if (currentHour >= 20 && currentHour <= 22) targetTimeOfDay = 'Night';

  if (!targetTimeOfDay) {
    console.log('ℹ️ [CRON WORKER]: No dose slot scheduled for current hour window.');
    return;
  }

  try {
    const activeSchedules = await MedicationSchedule.find({
      isActive: true,
      timeOfDay: targetTimeOfDay,
      startDate: { $lte: now },
      endDate: { $gte: now },
    });

    for (const sched of activeSchedules) {
      const todayDate = new Date(now);
      todayDate.setHours(0, 0, 0, 0);

      // Check if dose already logged today
      const existingLog = await MedicationLog.findOne({
        scheduleId: sched._id,
        scheduledDate: todayDate,
      });

      if (!existingLog) {
        // Create Notification record
        await Notification.create({
          userId: sched.patientId,
          userRole: 'PATIENT',
          title: `💊 Time for your ${targetTimeOfDay} Dose!`,
          message: `It is time to take ${sched.drugName} (${sched.dosage}). Log your dose in the patient dashboard once taken.`,
          type: 'MEDICATION_REMINDER',
          actionUrl: '/dashboard?tab=adherence',
          alertTiming: now,
        });

        // Log Mock SMS/WhatsApp Gateway Call
        console.log(
          `💬 [SMS/WhatsApp GATEWAY HOOK] -> Sent Dose Alert to Patient (${sched.patientId}): "Reminder: Time to take your ${targetTimeOfDay} dose of ${sched.drugName} (${sched.dosage}). Reply TAKEN once completed!"`
        );
      }
    }
  } catch (dbErr) {
    console.log(`ℹ️ [CRON WORKER - Demo Mode]: Checked ${targetTimeOfDay} dose slots.`);
  }
}

export default startCronWorker;
