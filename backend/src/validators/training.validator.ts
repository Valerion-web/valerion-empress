import { z } from 'zod';

export const createTrainingSchema = z.object({ body: z.object({ title: z.string().min(1), description: z.string().optional(), trainer: z.string().optional(), startDate: z.string().optional(), endDate: z.string().optional() }) });
export const updateTrainingSchema = z.object({ body: z.object({ title: z.string().min(1).optional(), description: z.string().optional(), trainer: z.string().optional(), startDate: z.string().optional(), endDate: z.string().optional() }) });
export const trainingIdSchema = z.object({ params: z.object({ id: z.string().uuid() }) });
export const assignSchema = z.object({ body: z.object({ userId: z.string().uuid() }) });
export const paginationQuery = z.object({ query: z.object({ q: z.string().optional(), page: z.string().optional(), limit: z.string().optional() }) });
