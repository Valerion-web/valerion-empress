import { prisma } from '../config/prisma.js';
import { Prisma } from '@prisma/client';

export class NotificationRepository {
  async create(data: Prisma.NotificationCreateInput) {
    return prisma.notification.create({ data });
  }

  async createBulk(data: Prisma.NotificationCreateManyInput[]) {
    return prisma.notification.createMany({ data });
  }

  async findById(id: string) {
    return prisma.notification.findUnique({ where: { id } });
  }

  async list(where: Prisma.NotificationWhereInput, page: number, limit: number, sortBy: string, sortOrder: 'asc' | 'desc') {
    const skip = (page - 1) * limit;
    const orderBy = { [sortBy]: sortOrder } as any;
    const [items, total] = await Promise.all([
      prisma.notification.findMany({ where, skip, take: limit, orderBy }),
      prisma.notification.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async listForUser(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const where = { userId } as Prisma.NotificationWhereInput;
    const [items, total] = await Promise.all([
      prisma.notification.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.notification.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async markRead(id: string) {
    return prisma.notification.update({ where: { id }, data: { readAt: new Date() } });
  }

  async delete(id: string) {
    return prisma.notification.delete({ where: { id } });
  }
}

export const notificationRepository = new NotificationRepository();
