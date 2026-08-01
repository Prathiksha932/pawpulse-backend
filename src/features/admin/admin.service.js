import { User } from '../users/user.model.js';
import { Animal } from '../animals/animal.model.js';
import { Appointment } from '../appointments/appointment.model.js';
import { DoctorProfile } from '../doctors/doctorProfile.model.js';
import ApiError from '../../shared/utils/ApiError.js';

export const getDashboardStats = async () => {
  const [userCounts, appointmentCounts, totalAnimals, pendingDoctors] = await Promise.all([
    User.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]),
    Appointment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Animal.countDocuments({ isActive: true }),
    DoctorProfile.countDocuments({ isApproved: false }),
  ]);

  return {
    usersByRole: userCounts.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {}),
    appointmentsByStatus: appointmentCounts.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {}),
    totalAnimals,
    pendingDoctorApprovals: pendingDoctors,
  };
};

export const listUsers = async ({ page, limit, role, accountStatus }) => {
  const filter = {};
  if (role) filter.role = role;
  if (accountStatus) filter.accountStatus = accountStatus;

  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  return { users, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const updateUserStatus = async (userId, isActive) => {
  const user = await User.findByIdAndUpdate(userId, { isActive }, { new: true });
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  return user;
};

export const getAppointmentTrends = async (days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return Appointment.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
};