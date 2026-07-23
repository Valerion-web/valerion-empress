import { z } from 'zod';

const attendanceStatusSchema = z.enum(['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'LEAVE']);

export const paginationSchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val)) : 1)).default('1'),
    limit: z.string().optional().transform((val) => {
      const parsed = val ? Math.max(1, parseInt(val)) : 10;
      return Math.min(parsed, 100);
    }).default('10'),
    sortBy: z.string().optional().default('date'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export const searchAttendanceSchema = z.object({
  query: z.object({
    q: z.string().min(1, 'Search query is required').max(100, 'Search query must not exceed 100 characters'),
    page: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val)) : 1)).default('1'),
    limit: z.string().optional().transform((val) => {
      const parsed = val ? Math.max(1, parseInt(val)) : 10;
      return Math.min(parsed, 100);
    }).default('10'),
  }),
});

export const filterAttendanceSchema = z.object({
  query: z.object({
    userId: z.string().uuid('Invalid user ID format').optional(),
    status: attendanceStatusSchema.optional(),
    date: z.string().optional(),
    page: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val)) : 1)).default('1'),
    limit: z.string().optional().transform((val) => {
      const parsed = val ? Math.max(1, parseInt(val)) : 10;
      return Math.min(parsed, 100);
    }).default('10'),
    sortBy: z.string().optional().default('date'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export const attendanceIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid attendance ID format'),
  }),
});

export const attendanceEmployeeSchema = z.object({
  params: z.object({
    userId: z.string().uuid('Invalid user ID format'),
  }),
  query: z.object({
    page: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val)) : 1)).default('1'),
    limit: z.string().optional().transform((val) => {
      const parsed = val ? Math.max(1, parseInt(val)) : 10;
      return Math.min(parsed, 100);
    }).default('10'),
    sortBy: z.string().optional().default('date'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export const attendanceDateSchema = z.object({
  query: z.object({
    date: z.string().min(1, 'Attendance date is required'),
    page: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val)) : 1)).default('1'),
    limit: z.string().optional().transform((val) => {
      const parsed = val ? Math.max(1, parseInt(val)) : 10;
      return Math.min(parsed, 100);
    }).default('10'),
    sortBy: z.string().optional().default('date'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export const reportAttendanceSchema = z.object({
  query: z.object({
    month: z.string().optional().transform((val) => (val ? Math.max(1, Math.min(12, parseInt(val))) : new Date().getMonth() + 1)).default(String(new Date().getMonth() + 1)),
    year: z.string().optional().transform((val) => (val ? Math.max(2000, parseInt(val)) : new Date().getFullYear())).default(String(new Date().getFullYear())),
  }),
});

export const checkInSchema = z.object({
  body: z.object({
    location: z.string().max(200, 'Location must not exceed 200 characters').optional(),
    status: attendanceStatusSchema.optional(),
  }),
});

export const checkOutSchema = z.object({
  body: z.object({
    status: attendanceStatusSchema.optional(),
    location: z.string().max(200, 'Location must not exceed 200 characters').optional(),
  }),
});

export const updateAttendanceSchema = z.object({
  body: z.object({
    userId: z.string().uuid('Invalid user ID format').optional(),
    date: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
    checkIn: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
    checkOut: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
    status: attendanceStatusSchema.optional(),
    location: z.string().max(200, 'Location must not exceed 200 characters').optional(),
  }).refine((data) => Object.keys(data).length > 0, {
    message: 'At least one update field is required',
  }),
});
