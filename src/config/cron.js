import cron from 'node-cron';
import { Reminder } from '../features/reminders/reminder.model.js';
import { logger } from './logger.js';
// import { sendReminderEmail } from '../features/notifications/email.service.js'; // wired once Nodemailer module exists

const processDueReminders = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dueReminders = await Reminder.find({
    dueDate: { $gte: today, $lt: tomorrow },
    isCompleted: false,
    notifiedAt: null, // the idempotency guard from Phase 2
  }).populate('ownerId', 'email fullName').populate('animalId', 'name');

  for (const reminder of dueReminders) {
    try {
      // await sendReminderEmail(reminder.ownerId.email, reminder);
      logger.info(`Reminder notification sent: ${reminder.title} for ${reminder.animalId.name}`);

      reminder.notifiedAt = new Date();
      await reminder.save();

      if (reminder.isRecurring && reminder.recurrenceIntervalDays) {
        const nextDueDate = new Date(reminder.dueDate);
        nextDueDate.setDate(nextDueDate.getDate() + reminder.recurrenceIntervalDays);

        await Reminder.create({
          animalId: reminder.animalId._id,
          ownerId: reminder.ownerId._id,
          type: reminder.type,
          title: reminder.title,
          dueDate: nextDueDate,
          isRecurring: true,
          recurrenceIntervalDays: reminder.recurrenceIntervalDays,
        });
      }
    } catch (error) {
      logger.error(`Failed to process reminder ${reminder._id}: ${error.message}`);
      // deliberately no throw — one failed reminder shouldn't stop the rest from processing
    }
  }

  logger.info(`Reminder job complete: ${dueReminders.length} reminder(s) processed`);
};

export const initializeCronJobs = () => {
  // Runs every day at 8:00 AM server time
  cron.schedule('0 8 * * *', () => {
    logger.info('Running daily reminder check...');
    processDueReminders();
  });
};