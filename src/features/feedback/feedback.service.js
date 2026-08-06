import { Feedback } from './feedback.model.js';
import ApiError from '../../shared/utils/ApiError.js';

export const submitFeedback = (userId, { subject, message, rating }) =>
  Feedback.create({ userId, subject, message, rating });

export const listFeedback = async ({ page = 1, limit = 10, status }) => {
  const filter = {};
  if (status) filter.status = status;
  const skip = (page - 1) * limit;
  const [feedback, total] = await Promise.all([
    Feedback.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('userId', 'fullName email'),
    Feedback.countDocuments(filter),
  ]);
  return { feedback, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const respondToFeedback = async (id, { status, adminResponse }) => {
  const feedback = await Feedback.findByIdAndUpdate(id, { status, adminResponse }, { new: true });
  if (!feedback) throw new ApiError(404, 'Feedback not found');
  return feedback;
};