import { z } from 'zod';

const performanceStatusSchema = z.enum(['DRAFT', 'SUBMITTED', 'APPROVED']);

export const createPerformanceSchema = z.object({
  body: z.object({
    employeeId: z.string().uuid('Invalid employee ID format'),
    reviewerId: z.string().uuid('Invalid reviewer ID format'),
    reviewPeriod: z.string().min(1, 'Review period is required'),
    reviewDate: z.string().min(1, 'Review date is required').transform((val) => new Date(val)),
    rating: z.number().int().min(1, 'Rating must be between 1 and 5').max(5, 'Rating must be between 1 and 5'),
    goals: z.string().min(5, 'Goals must be at least 5 characters'),
    achievements: z.string().min(5, 'Achievements must be at least 5 characters'),
    strengths: z.string().min(5, 'Strengths must be at least 5 characters'),
    improvements: z.string().min(5, 'Improvements must be at least 5 characters'),
    comments: z.string().min(5, 'Comments must be at least 5 characters'),
    status: performanceStatusSchema.optional().default('DRAFT'),
  }),
});

export const updatePerformanceSchema = z.object({
  body: z.object({
    reviewPeriod: z.string().min(1).optional(),
    reviewDate: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
    rating: z.number().int().min(1).max(5).optional(),
    goals: z.string().min(5).optional(),
    achievements: z.string().min(5).optional(),
    strengths: z.string().min(5).optional(),
    improvements: z.string().min(5).optional(),
    comments: z.string().min(5).optional(),
    status: performanceStatusSchema.optional(),
  }).refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required to update performance review',
  }),
});

export const performanceIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid performance review ID format'),
  }),
});

export const employeeIdSchema = z.object({
  params: z.object({
    employeeId: z.string().uuid('Invalid employee ID format'),
  }),
  query: z.object({
    page: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val)) : 1)).default('1'),
    limit: z.string().optional().transform((val) => {
      const parsed = val ? Math.max(1, parseInt(val)) : 10;
      return Math.min(parsed, 100);
    }).default('10'),
    sortBy: z.string().optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export const reviewerIdSchema = z.object({
  params: z.object({
    reviewerId: z.string().uuid('Invalid reviewer ID format'),
  }),
  query: z.object({
    page: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val)) : 1)).default('1'),
    limit: z.string().optional().transform((val) => {
      const parsed = val ? Math.max(1, parseInt(val)) : 10;
      return Math.min(parsed, 100);
    }).default('10'),
    sortBy: z.string().optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export const performanceQuerySchema = z.object({
  query: z.object({
    q: z.string().optional(),
    status: performanceStatusSchema.optional(),
    reviewPeriod: z.string().optional(),
    rating: z.string().optional().transform((val) => (val ? Math.max(1, Math.min(5, parseInt(val))) : undefined)),
    page: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val)) : 1)).default('1'),
    limit: z.string().optional().transform((val) => {
      const parsed = val ? Math.max(1, parseInt(val)) : 10;
      return Math.min(parsed, 100);
    }).default('10'),
    sortBy: z.string().optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});
