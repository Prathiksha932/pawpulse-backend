import { Consultation } from '../consultations/consultation.model.js';
import { Prescription } from '../prescriptions/prescription.model.js';
import { Animal } from './animal.model.js';
import ApiError from '../../shared/utils/ApiError.js';

export const getMedicalHistory = async (animalId, requestingUser) => {
  const animal = await Animal.findOne({ _id: animalId, isActive: true });
  if (!animal) {
    throw new ApiError(404, 'Animal not found');
  }

  const isOwner = animal.ownerId.equals(requestingUser._id);
  const isPrivileged = ['doctor', 'clinic_admin', 'super_admin'].includes(requestingUser.role);
  if (!isOwner && !isPrivileged) {
    throw new ApiError(403, 'You do not have permission to view this animal\'s records');
  }

  const [consultations, prescriptions] = await Promise.all([
    Consultation.find({ animalId, status: 'completed' })
      .sort({ createdAt: -1 })
      .populate('doctorId', 'fullName'),
    Prescription.find({ animalId })
      .sort({ issuedAt: -1 })
      .populate('doctorId', 'fullName'),
  ]);

  return { animal: { id: animal._id, name: animal.name }, consultations, prescriptions };
};