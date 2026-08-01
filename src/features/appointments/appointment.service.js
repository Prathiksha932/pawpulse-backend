import { Appointment } from './appointment.model.js';
import { Animal } from '../animals/animal.model.js';
import { DoctorProfile } from '../doctors/doctorProfile.model.js';
import ApiError from '../../shared/utils/ApiError.js';

const VALID_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

// Who is allowed to perform each transition
const TRANSITION_PERMISSIONS = {
  confirmed: ['doctor', 'clinic_admin', 'super_admin'],
  completed: ['doctor', 'clinic_admin', 'super_admin'],
  cancelled: ['owner', 'doctor', 'clinic_admin', 'super_admin'],
};

export const createAppointment = async (ownerId, appointmentData) => {
  const { animalId, doctorId, appointmentDate, startTime, reasonForVisit } = appointmentData;

  const animal = await Animal.findOne({ _id: animalId, ownerId, isActive: true });
  if (!animal) {
    throw new ApiError(404, 'Animal not found or does not belong to you');
  }

  const doctorProfile = await DoctorProfile.findOne({ userId: doctorId, isApproved: true });
  if (!doctorProfile) {
    throw new ApiError(404, 'Doctor not found or not approved');
  }

  const conflict = await Appointment.findOne({
    doctorId,
    appointmentDate,
    startTime,
    status: { $in: ['pending', 'confirmed'] },
  });
  if (conflict) {
    throw new ApiError(409, 'This time slot is no longer available');
  }

  const endTime = addMinutesToTime(startTime, doctorProfile.slotDurationMinutes);

  return Appointment.create({
    ownerId,
    animalId,
    doctorId,
    appointmentDate,
    startTime,
    endTime,
    reasonForVisit,
  });
};

export const getAppointments = async (requestingUser, queryParams) => {
  const { page = 1, limit = 10, status } = queryParams;

  const filter = {};
  if (requestingUser.role === 'owner') filter.ownerId = requestingUser._id;
  if (requestingUser.role === 'doctor') filter.doctorId = requestingUser._id;
  if (status) filter.status = status;

  const skip = (page - 1) * limit;

  const [appointments, total] = await Promise.all([
    Appointment.find(filter)
      .sort({ appointmentDate: -1 })
      .skip(skip)
      .limit(limit)
      .populate('animalId', 'name species breed')
      .populate('ownerId', 'fullName email')
      .populate('doctorId', 'fullName email'),
    Appointment.countDocuments(filter),
  ]);

  return { appointments, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const updateAppointmentStatus = async (appointmentId, requestingUser, { status, cancellationReason }) => {
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    throw new ApiError(404, 'Appointment not found');
  }

  const isParticipant =
    appointment.ownerId.equals(requestingUser._id) || appointment.doctorId.equals(requestingUser._id);
  const isPrivileged = ['clinic_admin', 'super_admin'].includes(requestingUser.role);

  if (!isParticipant && !isPrivileged) {
    throw new ApiError(403, 'You are not a participant in this appointment');
  }

  const allowedNextStates = VALID_TRANSITIONS[appointment.status];
  if (!allowedNextStates.includes(status)) {
    throw new ApiError(
      400,
      `Cannot transition from '${appointment.status}' to '${status}'`
    );
  }

  const allowedRoles = TRANSITION_PERMISSIONS[status];
  if (!allowedRoles.includes(requestingUser.role)) {
    throw new ApiError(403, `Role '${requestingUser.role}' cannot perform this transition`);
  }

  appointment.status = status;
  if (status === 'cancelled') {
    appointment.cancellationReason = cancellationReason;
  }

  await appointment.save();
  return appointment;
};

function addMinutesToTime(timeString, minutesToAdd) {
  let [h, m] = timeString.split(':').map(Number);
  m += minutesToAdd;
  h += Math.floor(m / 60);
  m = m % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}