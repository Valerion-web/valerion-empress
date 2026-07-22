import { prisma } from '../config/prisma.js';
import { BaseRepository } from './base.repository.js';

export class LeaveRepository extends BaseRepository<any> {
  constructor() {
    super('leave');
  }

  async findByUser(userId: string) {
    return prisma.leave.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  async approve(id: string, approvedById: string, comments?: string) {
    return prisma.leave.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedById,
        comments,
      },
    });
  }
}
