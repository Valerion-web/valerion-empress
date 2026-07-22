import { prisma } from '../config/prisma.js';

export class LeaveService {
  async requestLeave(userId: string, data: Record<string, unknown>) {
    return prisma.leave.create({ data: { ...data, userId } as any });
  }

  async listLeaves(userId: string) {
    return prisma.leave.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  async approveLeave(id: string, approvedById: string) {
    return prisma.leave.update({
      where: { id },
      data: { status: 'APPROVED', approvedById },
    });
  }
}
