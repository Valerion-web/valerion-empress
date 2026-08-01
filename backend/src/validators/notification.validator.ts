import { z } from 'zod';

export const createNotificationSchema = z.object({
  body: z.object({
    userId: z.string().uuid().optional(),
    title: z.string().min(1).max(200),
    body: z.string().min(1).max(2000),
    broadcast: z.boolean().optional(),
  }),
});

export const notificationIdSchema = z.object({ params: z.object({ id: z.string().uuid() }) });

export const notificationQuerySchema = z.object({ query: z.object({ q: z.string().optional(), isRead: z.union([z.literal('true'), z.literal('false')]).optional(), page: z.string().optional(), limit: z.string().optional(), sortBy: z.string().optional(), sortOrder: z.union([z.literal('asc'), z.literal('desc')]).optional() }) });
