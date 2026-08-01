import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    consultationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Consultation',
      required: true,
      index: true,
    },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, trim: true },
    attachmentUrl: { type: String, default: '' },
    readAt: Date,
  },
  { timestamps: true }
);

// Every message-history fetch queries "this consultation, ordered by time" —
// same compound-index reasoning as Appointments in Module 4.
messageSchema.index({ consultationId: 1, createdAt: 1 });

export const Message = mongoose.model('Message', messageSchema);