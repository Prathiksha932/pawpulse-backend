import { z } from 'zod';

const scheduleEntrySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Time must be in HH:MM 24hr format'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Time must be in HH:MM 24hr format'),
}).refine((data) => data.startTime < data.endTime, {
  message: 'startTime must be before endTime',
  path: ['endTime'],
});

export const createDoctorProfileSchema = z.object({
  specialization: z.string().trim().min(2).max(100),
  licenseNumber: z.string().trim().min(3).max(50),
  yearsOfExperience: z.coerce.number().int().min(0).optional(),
  consultationFee: z.coerce.number().positive(),
  bio: z.string().trim().max(1000).optional(),
  weeklySchedule: z.array(scheduleEntrySchema).min(1, 'At least one working day is required'),
  slotDurationMinutes: z.coerce.number().int().min(10).max(120).optional(),
});

export const updateDoctorProfileSchema = createDoctorProfileSchema.partial();