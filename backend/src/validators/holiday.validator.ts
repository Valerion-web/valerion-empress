import { z } from 'zod';

export const createHolidaySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  holidayDate: z.string().min(1),
  holidayType: z.enum(['NATIONAL', 'REGIONAL', 'COMPANY', 'OPTIONAL']).optional(),
  departmentId: z.string().optional().nullable(),
  isRecurring: z.boolean().optional(),
});

export const updateHolidaySchema = createHolidaySchema.partial();
