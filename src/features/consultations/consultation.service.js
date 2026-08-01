import { Consultation } from './consultation.model.js';
import { Message } from './message.model.js';
import { Appointment } from '../appointments/appointment.model.js';
import ApiError from '../../shared/utils/ApiError.js';

export const startConsultation = async (doctorId, appointmentId) => {
  const appointment = await Appointment.findOne({ _id: appointmentId, doctorId });
  if (!appointment) {
    throw new ApiError(404, 'Appointment not found');
  }
  if (appointment.status !== 'confirmed') {
    throw new ApiError(400, 'Only confirmed appointments can start a consultation');
  }

  const existing = await Consultation.findOne({ appointmentId });
  if (existing) {
    throw new ApiError(409, 'A consultation already exists for this appointment');
  }

  return Consultation.create({
    appointmentId,
    ownerId: appointment.ownerId,
    doctorId: appointment.doctorId,
    animalId: appointment.animalId,
  });
};

export const endConsultation = async (consultationId, doctorId, { diagnosis, symptoms }) => {
  const consultation = await Consultation.findOne({ _id: consultationId, doctorId });
  if (!consultation) {
    throw new ApiError(404, 'Consultation not found');
  }
  if (consultation.status === 'completed') {
    throw new ApiError(400, 'Consultation already completed');
  }

  consultation.diagnosis = diagnosis;
  if (symptoms) consultation.symptoms = symptoms;
  consultation.status = 'completed';
  consultation.endedAt = new Date();
  await consultation.save();

  await Appointment.findByIdAndUpdate(consultation.appointmentId, { status: 'completed' });

  return consultation;
};

export const getConsultationById = async (consultationId, requestingUser) => {
  const consultation = await Consultation.findById(consultationId)
    .populate('animalId', 'name species breed')
    .populate('ownerId', 'fullName email')
    .populate('doctorId', 'fullName email');

  if (!consultation) {
    throw new ApiError(404, 'Consultation not found');
  }

  const isParticipant =
    consultation.ownerId._id.equals(requestingUser._id) ||
    consultation.doctorId._id.equals(requestingUser._id);
  const isPrivileged = ['clinic_admin', 'super_admin'].includes(requestingUser.role);

  if (!isParticipant && !isPrivileged) {
    throw new ApiError(403, 'You are not a participant in this consultation');
  }

  return consultation;
};

export const getMessageHistory = async (consultationId, requestingUser, { page, limit }) => {
  // Reuse the same participant check — a user shouldn't read messages
  // from a consultation they're not part of, same as viewing the consultation itself.
  await getConsultationById(consultationId, requestingUser);

  const skip = (page - 1) * limit;

  const [messages, total] = await Promise.all([
    Message.find({ consultationId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('senderId', 'fullName'),
    Message.countDocuments({ consultationId }),
  ]);

  return {
    messages: messages.reverse(), // re-flip to chronological order for display
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};