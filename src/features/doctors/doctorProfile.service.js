import { DoctorProfile } from './doctorProfile.model.js';
import { Appointment } from '../appointments/appointment.model.js';
import ApiError from '../../shared/utils/ApiError.js';

export const createProfile = async (userId, profileData) => {
  const existing = await DoctorProfile.findOne({ userId });
  if (existing) {
    throw new ApiError(409, 'Doctor profile already exists for this account');
  }

  return DoctorProfile.create({ ...profileData, userId });
};

export const updateProfile = async (userId, updates) => {
  const profile = await DoctorProfile.findOneAndUpdate({ userId }, updates, {
    new: true,
    runValidators: true,
  });

  if (!profile) {
    throw new ApiError(404, 'Doctor profile not found');
  }

  return profile;
};

export const listApprovedDoctors = async ({ page, limit, specialization }) => {
  const filter = { isApproved: true };
  if (specialization) filter.specialization = specialization;

  const skip = (page - 1) * limit;

  const [doctors, total] = await Promise.all([
    DoctorProfile.find(filter).skip(skip).limit(limit).populate('userId', 'fullName email avatar'),
    DoctorProfile.countDocuments(filter),
  ]);

  return { doctors, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const approveDoctor = async (doctorUserId) => {
  const profile = await DoctorProfile.findOneAndUpdate(
    { userId: doctorUserId },
    { isApproved: true },
    { new: true }
  );

  if (!profile) {
    throw new ApiError(404, 'Doctor profile not found');
  }

  await User.findByIdAndUpdate(doctorUserId, { accountStatus: 'active' });

  return profile;
};

// --- The core algorithm from Phase 2 ---
export const getAvailableSlots = async (doctorUserId, dateString) => {
  const profile = await DoctorProfile.findOne({ userId: doctorUserId, isApproved: true });
  if (!profile) {
    throw new ApiError(404, 'Approved doctor not found');
  }

  const requestedDate = new Date(dateString);

  const isUnavailable = profile.unavailableDates.some(
    (d) => d.toDateString() === requestedDate.toDateString()
  );
  if (isUnavailable) return [];

  const daySchedule = profile.weeklySchedule.find(
    (s) => s.dayOfWeek === requestedDate.getDay()
  );
  if (!daySchedule) return [];

  const allSlots = generateSlotsForDay(
    daySchedule.startTime,
    daySchedule.endTime,
    profile.slotDurationMinutes
  );

  const dayStart = new Date(requestedDate.setHours(0, 0, 0, 0));
  const dayEnd = new Date(requestedDate.setHours(23, 59, 59, 999));

  const existingAppointments = await Appointment.find({
    doctorId: doctorUserId,
    appointmentDate: { $gte: dayStart, $lte: dayEnd },
    status: { $in: ['pending', 'confirmed'] },
  }).select('startTime');

  const bookedTimes = new Set(existingAppointments.map((a) => a.startTime));

  return allSlots.filter((slot) => !bookedTimes.has(slot));
};

function generateSlotsForDay(startTime, endTime, durationMinutes) {
  const slots = [];
  let [h, m] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  const endTotalMinutes = endH * 60 + endM;

  while (h * 60 + m + durationMinutes <= endTotalMinutes) {
    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    m += durationMinutes;
    if (m >= 60) {
      h += Math.floor(m / 60);
      m = m % 60;
    }
  }

  return slots;
}