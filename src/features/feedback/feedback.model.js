import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    rating: { type: Number, min: 1, max: 5 },
    status: { type: String, enum: ['open', 'reviewed', 'resolved'], default: 'open' },
    adminResponse: { type: String, trim: true },
  },
  { timestamps: true }
);

export const Feedback = mongoose.model('Feedback', feedbackSchema);