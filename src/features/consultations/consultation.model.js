import mongoose from 'mongoose';

const consultationSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
      unique: true,
    },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    animalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Animal', required: true },
    symptoms: { type: String, trim: true },
    diagnosis: { type: String, trim: true },
    aiSymptomAnalysis: {
      summary: String,
      suggestedConditions: [String],
      confidence: Number,
    },
    status: {
      type: String,
      enum: ['in_progress', 'completed'],
      default: 'in_progress',
    },
    startedAt: { type: Date, default: Date.now },
    endedAt: Date,
  },
  { timestamps: true }
);

export const Consultation = mongoose.model('Consultation', consultationSchema);