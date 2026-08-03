import { z } from 'zod';

export const createTicketSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    category: z.string().min(1),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
  }),
});

export const updateTicketSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    category: z.string().min(1).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
    assignedToId: z.string().optional().nullable(),
  }),
});

export const commentSchema = z.object({
  body: z.object({
    message: z.string().min(1),
  }),
});

export const ticketIdSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});

export const paginationQuery = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    search: z.string().optional(),
    status: z.string().optional(),
    priority: z.string().optional(),
    category: z.string().optional(),
    assignedToId: z.string().optional(),
    employeeId: z.string().optional(),
  }),
});
