import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    dosage: { type: String, required: true, trim: true },       // e.g. "250mg"
    frequency: { type: String, required: true, trim: true },      // e.g. "Twice daily"
    duration: { type: String, required: true, trim: true },        // e.g. "7 days"
    instructions: { type: String, trim: true },
  },
  { _id: false }
);

const prescriptionSchema = new mongoose.Schema(
  {
    consultationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Consultation',
      required: true,
      unique: true,
    },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    animalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Animal', required: true },
    medicines: {
      type: [medicineSchema],
      validate: [(arr) => arr.length > 0, 'At least one medicine is required'],
    },
    additionalNotes: { type: String, trim: true },
    issuedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Prescription = mongoose.model('Prescription', prescriptionSchema);