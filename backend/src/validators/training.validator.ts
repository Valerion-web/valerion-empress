import { z } from 'zod';

export const createTrainingSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    category: z.string().optional(),
    trainer: z.string().optional(),
    departmentId: z.string().uuid().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    status: z.enum(['PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED']).optional(),
  }),
});

export const updateTrainingSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    category: z.string().optional(),
    trainer: z.string().optional(),
    departmentId: z.string().uuid().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    status: z.enum(['PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED']).optional(),
  }),
});

export const trainingIdSchema = z.object({ params: z.object({ id: z.string().uuid() }) });
export const assignSchema = z.object({ body: z.object({ userId: z.string().uuid().optional(), assignedBy: z.string().optional() }) });
export const paginationQuery = z.object({
  query: z.object({
    q: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
    status: z.string().optional(),
    category: z.string().optional(),
    departmentId: z.string().optional(),
  }),
});
