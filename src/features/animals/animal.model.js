import mongoose from 'mongoose';

const animalSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Animal name is required'],
      trim: true,
    },
    species: {
      type: String,
      required: [true, 'Species is required'],
      enum: ['dog', 'cat', 'bird', 'rabbit', 'reptile', 'other'],
    },
    breed: { type: String, trim: true, default: 'Unknown' },
    gender: {
      type: String,
      enum: ['male', 'female', 'unknown'],
      default: 'unknown',
    },
    dateOfBirth: Date,
    weight: { type: Number, min: 0 },
    color: { type: String, trim: true },
    microchipId: { type: String, trim: true, unique: true, sparse: true },
    avatar: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    isDeceased: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

animalSchema.index({ name: 'text', breed: 'text', species: 'text' });

export const Animal = mongoose.model('Animal', animalSchema);