import { z } from 'zod';

export const createAnimalSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(50),
  species: z.enum(['dog', 'cat', 'bird', 'rabbit', 'reptile', 'other']),
  breed: z.string().trim().max(50).optional(),
  gender: z.enum(['male', 'female', 'unknown']).optional(),
  dateOfBirth: z.coerce.date().optional(),
  weight: z.coerce.number().positive().optional(),
  color: z.string().trim().max(30).optional(),
  microchipId: z.string().trim().optional(),
});

export const updateAnimalSchema = createAnimalSchema.partial();

export const animalQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  species: z.enum(['dog', 'cat', 'bird', 'rabbit', 'reptile', 'other']).optional(),
  search: z.string().trim().optional(),
  sortBy: z.enum(['createdAt', 'name', 'dateOfBirth']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});