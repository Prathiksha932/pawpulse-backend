import { z } from 'zod';

export const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(50, 'Full name must be under 50 characters'),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Please provide a valid email address'),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),

  role: z.enum(['owner', 'doctor'], {
    errorMap: () => ({ message: 'Role must be either "owner" or "doctor"' }),
  }),

  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, 'Please provide a valid 10-digit phone number')
    .optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Please provide a valid email address'),
  password: z.string().min(1, 'Password is required'),
});