import { prisma } from '../config/prisma.js';
import { Prisma } from '@prisma/client';

export class TrainingRepository {
  async create(data: Prisma.TrainingCreateInput) {
    return prisma.training.create({ data });
  }

  async findById(id: string) {
    return prisma.training.findUnique({ where: { id }, include: { department: true } });
  }

  async list(where: Prisma.TrainingWhereInput, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      prisma.training.findMany({ where, skip, take: limit, orderBy: { startDate: 'desc' } }),
      prisma.training.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async update(id: string, data: Prisma.TrainingUpdateInput) {
    return prisma.training.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.training.delete({ where: { id } });
  }

  async assign(trainingId: string, userId: string) {
    return prisma.trainingAssignment.create({ data: { trainingId, userId } });
  }

  async complete(trainingId: string, userId: string) {
    return prisma.trainingAssignment.update({ where: { trainingId_userId: { trainingId, userId } }, data: { completionStatus: 'COMPLETED' } });
  }

  async listByUser(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const where = { userId } as Prisma.TrainingAssignmentWhereInput;
    const [items, total] = await Promise.all([
      prisma.trainingAssignment.findMany({ where, skip, take: limit, orderBy: { assignedAt: 'desc' }, include: { training: true } }),
      prisma.trainingAssignment.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async listAssignments(trainingId: string) {
    return prisma.trainingAssignment.findMany({ where: { trainingId }, include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } } });
  }
}

export const trainingRepository = new TrainingRepository();
