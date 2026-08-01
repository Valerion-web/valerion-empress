import { notificationRepository } from '../repositories/notification.repository.js';
import { Prisma } from '@prisma/client';

export class NotificationService {
  async sendToEmployee(userId: string, title: string, body: string, actorId?: string) {
    const data: Prisma.NotificationCreateInput = { userId, title, body } as any;
    return notificationRepository.create(data);
  }

  async broadcastToAll(title: string, body: string) {
    // createMany expects plain objects matching DB columns
    const users = await (await import('../config/prisma.js')).prisma.user.findMany({ select: { id: true } });
    const rows = users.map((u: any) => ({ userId: u.id, title, body, createdAt: new Date(), updatedAt: new Date() }));
    return notificationRepository.createBulk(rows as any[]);
  }

  async get(id: string) {
    const n = await notificationRepository.findById(id);
    if (!n) throw new Error('Notification not found');
    return n;
  }

  async list(query: { q?: string; isRead?: string; page?: number; limit?: number; sortBy?: string; sortOrder?: 'asc' | 'desc' }) {
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 10);
    const where: Prisma.NotificationWhereInput = { ...(query.q && { title: { contains: query.q, mode: 'insensitive' } }), ...(typeof query.isRead !== 'undefined' ? (query.isRead === 'true' ? { NOT: { readAt: null } } : { readAt: null }) : {}) };
    return notificationRepository.list(where, page, limit, query.sortBy || 'createdAt', query.sortOrder || 'desc');
  }

  async myNotifications(userId: string, page = 1, limit = 20) {
    return notificationRepository.listForUser(userId, page, limit);
  }

  async markRead(id: string, actorId: string) {
    const n = await notificationRepository.findById(id);
    if (!n) throw new Error('Notification not found');
    if (n.userId !== actorId) throw new Error('Forbidden: cannot mark others notification');
    return notificationRepository.markRead(id);
  }

  async delete(id: string, actorId: string) {
    const n = await notificationRepository.findById(id);
    if (!n) throw new Error('Notification not found');
    if (n.userId !== actorId) throw new Error('Forbidden: cannot delete others notification');
    return notificationRepository.delete(id);
  }
}

export const notificationService = new NotificationService();
