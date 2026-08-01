import mongoose from 'mongoose';

const doctorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      trim: true,
    },
    licenseNumber: {
      type: String,
      required: [true, 'License number is required'],
      unique: true,
      trim: true,
    },
    yearsOfExperience: { type: Number, min: 0, default: 0 },
    consultationFee: { type: Number, required: true, min: 0 },
    bio: { type: String, trim: true, maxlength: 1000 },
    weeklySchedule: [
      {
        dayOfWeek: { type: Number, min: 0, max: 6, required: true },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
      },
    ],
    slotDurationMinutes: { type: Number, default: 30, min: 10 },
    unavailableDates: [Date],
    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const DoctorProfile = mongoose.model('DoctorProfile', doctorProfileSchema);