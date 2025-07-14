import { z } from 'zod';

export const searchParamsSchema = z.object({
  q: z.string().max(100).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).refine(n => n >= 1).optional().default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).refine(n => n >= 1 && n <= 100).optional().default('20'),
  city: z.string().max(50).optional(),
  degree: z.string().max(50).optional(),
  specialties: z.string().max(100).optional(),
  minExperience: z.string().regex(/^\d+$/).transform(Number).refine(n => n >= 0 && n <= 50).optional(),
  maxExperience: z.string().regex(/^\d+$/).transform(Number).refine(n => n >= 0 && n <= 50).optional(),
  sortBy: z.enum(['firstName', 'lastName', 'yearsOfExperience', 'city']).optional().default('firstName'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

export type SearchParams = z.infer<typeof searchParamsSchema>;

export const advocateSchema = z.object({
  id: z.number().optional(),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  city: z.string().min(1).max(50),
  degree: z.string().min(1).max(100),
  specialties: z.array(z.string().max(50)),
  yearsOfExperience: z.number().min(0).max(50),
  phoneNumber: z.string().regex(/^\+?[\d\s\-\(\)]{10,15}$/),
});

export type Advocate = z.infer<typeof advocateSchema>;