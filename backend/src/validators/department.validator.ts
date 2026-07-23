import { z } from 'zod';

export const createDepartmentSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Department name is required').max(100, 'Department name must not exceed 100 characters'),
    code: z.string().min(1, 'Department code is required').max(20, 'Department code must not exceed 20 characters'),
    description: z.string().max(500, 'Description must not exceed 500 characters').optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional().default('ACTIVE'),
  }),
});

export const updateDepartmentSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Department name must not be empty').max(100, 'Department name must not exceed 100 characters').optional(),
    code: z.string().min(1, 'Department code must not be empty').max(20, 'Department code must not exceed 20 characters').optional(),
    description: z.string().max(500, 'Description must not exceed 500 characters').optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  }),
});

export const searchDepartmentSchema = z.object({
  query: z.object({
    q: z.string().min(1, 'Search query is required').max(100, 'Search query must not exceed 100 characters'),
    page: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val)) : 1)).default('1'),
    limit: z.string().optional().transform((val) => {
      const parsed = val ? Math.max(1, parseInt(val)) : 10;
      return Math.min(parsed, 100);
    }).default('10'),
  }),
});

export const filterDepartmentSchema = z.object({
  query: z.object({
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
    page: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val)) : 1)).default('1'),
    limit: z.string().optional().transform((val) => {
      const parsed = val ? Math.max(1, parseInt(val)) : 10;
      return Math.min(parsed, 100);
    }).default('10'),
    sortBy: z.string().optional().default('name'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  }),
});

export const paginationSchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val)) : 1)).default('1'),
    limit: z.string().optional().transform((val) => {
      const parsed = val ? Math.max(1, parseInt(val)) : 10;
      return Math.min(parsed, 100);
    }).default('10'),
    sortBy: z.string().optional().default('name'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  }),
});

export const departmentIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid department ID format'),
  }),
});
