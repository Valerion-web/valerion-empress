import { z } from 'zod';

/**
 * Create Employee Validation Schema
 */
export const createEmployeeSchema = z.object({
  body: z.object({
    employeeId: z
      .string()
      .min(1, 'Employee ID is required')
      .max(50, 'Employee ID must not exceed 50 characters'),
    firstName: z
      .string()
      .min(1, 'First name is required')
      .max(100, 'First name must not exceed 100 characters'),
    lastName: z
      .string()
      .min(1, 'Last name is required')
      .max(100, 'Last name must not exceed 100 characters'),
    email: z
      .string()
      .email('Invalid email format'),
    phone: z
      .string()
      .optional()
      .refine((val) => !val || /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(val), {
        message: 'Invalid phone number format',
      }),
    gender: z
      .enum(['MALE', 'FEMALE', 'OTHER'])
      .optional(),
    dateOfBirth: z
      .string()
      .datetime()
      .optional()
      .transform((val) => (val ? new Date(val) : undefined)),
    departmentId: z
      .string()
      .min(1, 'Department ID is required')
      .uuid('Invalid department ID format'),
    designationId: z
      .string()
      .min(1, 'Designation ID is required')
      .uuid('Invalid designation ID format'),
    joiningDate: z
      .string()
      .datetime('Invalid date format')
      .transform((val) => new Date(val)),
    employmentType: z
      .enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'TEMPORARY', 'INTERN'])
      .optional()
      .default('FULL_TIME'),
    salary: z
      .number()
      .positive('Salary must be a positive number')
      .optional(),
    profileImage: z
      .string()
      .url('Invalid URL format')
      .optional(),
    address: z
      .string()
      .max(500, 'Address must not exceed 500 characters')
      .optional(),
    emergencyContact: z
      .string()
      .max(100, 'Emergency contact must not exceed 100 characters')
      .optional(),
    bloodGroup: z
      .string()
      .max(10, 'Blood group must not exceed 10 characters')
      .optional(),
  }),
});

/**
 * Update Employee Validation Schema
 */
export const updateEmployeeSchema = z.object({
  body: z.object({
    employeeId: z
      .string()
      .min(1, 'Employee ID is required')
      .max(50, 'Employee ID must not exceed 50 characters')
      .optional(),
    firstName: z
      .string()
      .min(1, 'First name must not be empty')
      .max(100, 'First name must not exceed 100 characters')
      .optional(),
    lastName: z
      .string()
      .min(1, 'Last name must not be empty')
      .max(100, 'Last name must not exceed 100 characters')
      .optional(),
    email: z
      .string()
      .email('Invalid email format')
      .optional(),
    phone: z
      .string()
      .refine((val) => /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(val), {
        message: 'Invalid phone number format',
      })
      .optional(),
    gender: z
      .enum(['MALE', 'FEMALE', 'OTHER'])
      .optional(),
    dateOfBirth: z
      .string()
      .datetime()
      .optional()
      .transform((val) => (val ? new Date(val) : undefined)),
    departmentId: z
      .string()
      .uuid('Invalid department ID format')
      .optional(),
    designationId: z
      .string()
      .uuid('Invalid designation ID format')
      .optional(),
    employmentType: z
      .enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'TEMPORARY', 'INTERN'])
      .optional(),
    salary: z
      .number()
      .positive('Salary must be a positive number')
      .optional(),
    profileImage: z
      .string()
      .url('Invalid URL format')
      .optional(),
    address: z
      .string()
      .max(500, 'Address must not exceed 500 characters')
      .optional(),
    emergencyContact: z
      .string()
      .max(100, 'Emergency contact must not exceed 100 characters')
      .optional(),
    bloodGroup: z
      .string()
      .max(10, 'Blood group must not exceed 10 characters')
      .optional(),
    status: z
      .enum(['ACTIVE', 'INACTIVE', 'RESIGNED'])
      .optional(),
  }),
});

/**
 * Search Employee Validation Schema
 */
export const searchEmployeeSchema = z.object({
  query: z.object({
    q: z
      .string()
      .min(1, 'Search query is required')
      .max(100, 'Search query must not exceed 100 characters'),
    page: z
      .string()
      .optional()
      .transform((val) => (val ? Math.max(1, parseInt(val)) : 1))
      .default('1'),
    limit: z
      .string()
      .optional()
      .transform((val) => {
        const parsed = val ? Math.max(1, parseInt(val)) : 10;
        return Math.min(parsed, 100);
      })
      .default('10'),
  }),
});

/**
 * Filter Employee Validation Schema
 */
export const filterEmployeeSchema = z.object({
  query: z.object({
    departmentId: z.string().uuid().optional(),
    status: z
      .enum(['ACTIVE', 'INACTIVE', 'RESIGNED'])
      .optional(),
    designationId: z.string().uuid().optional(),
    employmentType: z
      .enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'TEMPORARY', 'INTERN'])
      .optional(),
    page: z
      .string()
      .optional()
      .transform((val) => (val ? Math.max(1, parseInt(val)) : 1))
      .default('1'),
    limit: z
      .string()
      .optional()
      .transform((val) => {
        const parsed = val ? Math.max(1, parseInt(val)) : 10;
        return Math.min(parsed, 100);
      })
      .default('10'),
    sortBy: z
      .string()
      .optional()
      .default('firstName'),
    sortOrder: z
      .enum(['asc', 'desc'])
      .optional()
      .default('asc'),
  }),
});

/**
 * Pagination Validation Schema
 */
export const paginationSchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? Math.max(1, parseInt(val)) : 1))
      .default('1'),
    limit: z
      .string()
      .optional()
      .transform((val) => {
        const parsed = val ? Math.max(1, parseInt(val)) : 10;
        return Math.min(parsed, 100);
      })
      .default('10'),
    sortBy: z
      .string()
      .optional()
      .default('firstName'),
    sortOrder: z
      .enum(['asc', 'desc'])
      .optional()
      .default('asc'),
  }),
});

/**
 * Employee ID Validation Schema
 */
export const employeeIdSchema = z.object({
  params: z.object({
    id: z
      .string()
      .uuid('Invalid employee ID format'),
  }),
});

/**
 * Department ID Validation Schema
 */
export const departmentIdSchema = z.object({
  params: z.object({
    departmentId: z
      .string()
      .uuid('Invalid department ID format'),
  }),
});

/**
 * Status Validation Schema
 */
export const statusSchema = z.object({
  params: z.object({
    status: z
      .enum(['ACTIVE', 'INACTIVE', 'RESIGNED'], {
        errorMap: () => ({ message: 'Invalid status. Valid values: ACTIVE, INACTIVE, RESIGNED' }),
      }),
  }),
});
