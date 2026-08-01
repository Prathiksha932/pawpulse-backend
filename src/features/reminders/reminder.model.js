import mongoose from 'mongoose';

const reminderSchema = new mongoose.Schema(
  {
    animalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Animal', required: true, index: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['vaccination', 'medicine'], required: true },
    title: { type: String, required: true, trim: true },
    dueDate: { type: Date, required: true, index: true },
    isRecurring: { type: Boolean, default: false },
    recurrenceIntervalDays: { type: Number, min: 1 },
    isCompleted: { type: Boolean, default: false },
    notifiedAt: Date,
  },
  { timestamps: true }
);

export const Reminder = mongoose.model('Reminder', reminderSchema);