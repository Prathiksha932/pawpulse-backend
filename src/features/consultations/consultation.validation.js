import { z } from 'zod';

export const startConsultationSchema = z.object({
  appointmentId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid appointment ID'),
});

export const endConsultationSchema = z.object({
  diagnosis: z.string().trim().min(3).max(2000),
  symptoms: z.string().trim().max(2000).optional(),
});

export const messageHistoryQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(30),
});