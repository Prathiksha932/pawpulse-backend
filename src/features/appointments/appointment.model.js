import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    animalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Animal',
      required: true,
      index: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
    reasonForVisit: {
      type: String,
      required: [true, 'Reason for visit is required'],
      trim: true,
    },
    cancellationReason: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

// Compound index: this collection is constantly queried by "this doctor, this date"
// (both the availability check and the doctor's own appointment list use this exact shape)
appointmentSchema.index({ doctorId: 1, appointmentDate: 1 });

export const Appointment = mongoose.model('Appointment', appointmentSchema);