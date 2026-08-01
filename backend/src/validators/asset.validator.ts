import { z } from 'zod';

const uuid = z.string().uuid('Invalid ID format');
const status = z.enum(['AVAILABLE', 'ASSIGNED', 'MAINTENANCE', 'RETIRED']);
const pagination = z.object({
  page: z.string().optional().transform((v) => Math.max(1, Number(v) || 1)),
  limit: z.string().optional().transform((v) => Math.min(100, Math.max(1, Number(v) || 10))),
});

export const assetIdSchema = z.object({ params: z.object({ id: uuid }) });
export const allocationAssetIdSchema = z.object({ params: z.object({ id: uuid }) });
export const assetQuerySchema = z.object({ query: pagination.extend({ q: z.string().optional(), status: status.optional(), categoryId: uuid.optional(), sortBy: z.enum(['name', 'createdAt', 'status', 'purchaseDate']).optional().default('createdAt'), sortOrder: z.enum(['asc', 'desc']).optional().default('desc') }) });
export const createAssetSchema = z.object({ body: z.object({ name: z.string().min(1).max(200), type: z.string().min(1).max(100), serialNumber: z.string().max(100).optional(), assetTag: z.string().max(100).optional(), categoryId: uuid.optional(), status: status.optional().default('AVAILABLE'), description: z.string().max(1000).optional(), purchasePrice: z.number().nonnegative().optional(), purchaseDate: z.string().datetime().optional(), warrantyUntil: z.string().datetime().optional() }) });
export const updateAssetSchema = z.object({ body: createAssetSchema.shape.body.partial().refine((value) => Object.keys(value).length > 0, 'At least one update field is required') });
export const categoryIdSchema = z.object({ params: z.object({ id: uuid }) });
export const createCategorySchema = z.object({ body: z.object({ name: z.string().min(1).max(100), description: z.string().max(500).optional() }) });
export const updateCategorySchema = z.object({ body: createCategorySchema.shape.body.partial().refine((value) => Object.keys(value).length > 0, 'At least one update field is required') });
export const assignmentSchema = z.object({ body: z.object({ userId: uuid, notes: z.string().max(500).optional() }) });
export const historyQuerySchema = z.object({ query: pagination });
