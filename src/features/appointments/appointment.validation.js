import { z } from 'zod';

export const createAppointmentSchema = z.object({
  animalId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid animal ID'),
  doctorId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid doctor ID'),
  appointmentDate: z.coerce.date(),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Invalid time format'),
  reasonForVisit: z.string().trim().min(3).max(500),
});

export const updateStatusSchema = z.object({
  status: z.enum(['confirmed', 'completed', 'cancelled']),
  cancellationReason: z.string().trim().max(300).optional(),
}).refine(
  (data) => data.status !== 'cancelled' || !!data.cancellationReason,
  { message: 'cancellationReason is required when cancelling', path: ['cancellationReason'] }
);