import { Prescription } from './prescription.model.js';
import { Consultation } from '../consultations/consultation.model.js';
import ApiError from '../../shared/utils/ApiError.js';

export const createPrescription = async (doctorId, { consultationId, medicines, additionalNotes }) => {
  const consultation = await Consultation.findOne({ _id: consultationId, doctorId });
  if (!consultation) {
    throw new ApiError(404, 'Consultation not found');
  }
  if (consultation.status !== 'completed') {
    throw new ApiError(400, 'Prescriptions can only be issued for completed consultations');
  }

  const existing = await Prescription.findOne({ consultationId });
  if (existing) {
    throw new ApiError(409, 'A prescription already exists for this consultation');
  }

  return Prescription.create({
    consultationId,
    doctorId,
    ownerId: consultation.ownerId,
    animalId: consultation.animalId,
    medicines,
    additionalNotes,
  });
};

export const getPrescriptionsForAnimal = async (animalId, requestingUser) => {
  const filter = { animalId };
  if (requestingUser.role === 'owner') filter.ownerId = requestingUser._id;

  return Prescription.find(filter)
    .sort({ issuedAt: -1 })
    .populate('doctorId', 'fullName')
    .populate('animalId', 'name species');
};