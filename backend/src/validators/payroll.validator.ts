import { z } from 'zod';

const paymentStatusSchema = z.enum(['PENDING', 'PAID']);

const salaryFields = z.object({
  basicSalary: z.number().min(0, 'Basic salary cannot be negative'),
  allowances: z.number().min(0, 'Allowances cannot be negative').optional().default(0),
  deductions: z.number().min(0, 'Deductions cannot be negative').optional().default(0),
  bonus: z.number().min(0, 'Bonus cannot be negative').optional().default(0),
});

export const createPayrollSchema = z.object({
  body: z.object({
    userId: z.string().uuid('Invalid employee ID format'),
    basicSalary: salaryFields.shape.basicSalary,
    allowances: salaryFields.shape.allowances,
    deductions: salaryFields.shape.deductions,
    bonus: salaryFields.shape.bonus,
    month: z.number().int().min(1).max(12),
    year: z.number().int().min(2000),
    paymentStatus: paymentStatusSchema.optional().default('PENDING'),
    paymentDate: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
  }),
});

export const updatePayrollSchema = z.object({
  body: z.object({
    basicSalary: salaryFields.shape.basicSalary.optional(),
    allowances: salaryFields.shape.allowances.optional(),
    deductions: salaryFields.shape.deductions.optional(),
    bonus: salaryFields.shape.bonus.optional(),
    month: z.number().int().min(1).max(12).optional(),
    year: z.number().int().min(2000).optional(),
    paymentStatus: paymentStatusSchema.optional(),
    paymentDate: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
  }).refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required to update payroll',
  }),
});

export const payrollIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid payroll ID format'),
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

export const payrollQuerySchema = z.object({
  query: z.object({
    q: z.string().optional(),
    paymentStatus: paymentStatusSchema.optional(),
    month: z.string().optional().transform((val) => (val ? Math.max(1, Math.min(12, parseInt(val))) : undefined)),
    year: z.string().optional().transform((val) => (val ? Math.max(2000, parseInt(val)) : undefined)),
    page: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val)) : 1)).default('1'),
    limit: z.string().optional().transform((val) => {
      const parsed = val ? Math.max(1, parseInt(val)) : 10;
      return Math.min(parsed, 100);
    }).default('10'),
    sortBy: z.string().optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export const monthlyPayrollSchema = z.object({
  query: z.object({
    month: z.string().optional().transform((val) => (val ? Math.max(1, Math.min(12, parseInt(val))) : new Date().getMonth() + 1)).default(String(new Date().getMonth() + 1)),
    year: z.string().optional().transform((val) => (val ? Math.max(2000, parseInt(val)) : new Date().getFullYear())).default(String(new Date().getFullYear())),
  }),
});

export const yearlyPayrollSchema = z.object({
  query: z.object({
    year: z.string().optional().transform((val) => (val ? Math.max(2000, parseInt(val)) : new Date().getFullYear())).default(String(new Date().getFullYear())),
  }),
});
