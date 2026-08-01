import { z } from 'zod';

export const uploadDocumentSchema = z.object({
  body: z.object({
    employeeId: z.string().uuid().optional(),
    documentName: z.string().min(1).max(200),
    documentType: z.string().min(1).max(100),
  }),
});

export const documentIdSchema = z.object({ params: z.object({ id: z.string().uuid() }) });

export const documentQuerySchema = z.object({ query: z.object({ q: z.string().optional(), documentType: z.string().optional(), page: z.string().optional(), limit: z.string().optional() }) });

export const employeeIdParamSchema = z.object({ params: z.object({ employeeId: z.string().uuid() }) });
