import { z } from 'zod';

const leaveTypeSchema = z.enum(['CASUAL', 'SICK', 'EARNED', 'MATERNITY', 'PATERNITY', 'UNPAID']);
const leaveStatusSchema = z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']);

export const createLeaveSchema = z.object({
  body: z.object({
    leaveType: leaveTypeSchema,
    startDate: z.string().min(1, 'Leave start date is required').transform((val) => new Date(val)),
    endDate: z.string().min(1, 'Leave end date is required').transform((val) => new Date(val)),
    reason: z.string().min(5, 'Reason must be at least 5 characters'),
    remarks: z.string().max(500).optional(),
  }),
});

export const updateLeaveSchema = z.object({
  body: z.object({
    leaveType: leaveTypeSchema.optional(),
    startDate: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
    endDate: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
    reason: z.string().min(5).optional(),
    remarks: z.string().max(500).optional(),
  }).refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required to update leave',
  }),
});

export const leaveIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid leave ID format'),
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

export const leaveQuerySchema = z.object({
  query: z.object({
    q: z.string().optional(),
    leaveType: leaveTypeSchema.optional(),
    status: leaveStatusSchema.optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    employeeId: z.string().uuid('Invalid user ID format').optional(),
    page: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val)) : 1)).default('1'),
    limit: z.string().optional().transform((val) => {
      const parsed = val ? Math.max(1, parseInt(val)) : 10;
      return Math.min(parsed, 100);
    }).default('10'),
    sortBy: z.string().optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export const leaveApprovalSchema = z.object({
  body: z.object({
    remarks: z.string().max(500).optional(),
  }),
});

export const monthlyLeaveReportSchema = z.object({
  query: z.object({
    month: z.string().optional().transform((val) => (val ? Math.max(1, Math.min(12, parseInt(val))) : new Date().getMonth() + 1)).default(String(new Date().getMonth() + 1)),
    year: z.string().optional().transform((val) => (val ? Math.max(2000, parseInt(val)) : new Date().getFullYear())).default(String(new Date().getFullYear())),
    employeeId: z.string().uuid('Invalid user ID format').optional(),
  }),
});
