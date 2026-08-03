import { prisma } from '../config/prisma.js';
import { Prisma } from '@prisma/client';

export class TrainingRepository {
  async create(data: Prisma.TrainingCreateInput) {
    return prisma.training.create({ data });
  }

  async findById(id: string) {
    return prisma.training.findUnique({
      where: { id },
      include: {
        department: true,
        trainingAssignments: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
        },
      },
    });
  }

  async list(where: Prisma.TrainingWhereInput, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      prisma.training.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startDate: 'desc' },
        include: {
          department: true,
          _count: { select: { trainingAssignments: true } },
        },
      }),
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

  async assign(trainingId: string, userId: string, assignedBy?: string) {
    return prisma.trainingAssignment.upsert({
      where: { trainingId_userId: { trainingId, userId } },
      update: {
        assignedBy: assignedBy ?? undefined,
        completionStatus: 'NOT_STARTED',
        completionDate: null,
        remarks: null,
      },
      create: {
        trainingId,
        userId,
        assignedBy,
        completionStatus: 'NOT_STARTED',
      },
    });
  }

  async complete(trainingId: string, userId: string, data?: Record<string, any>) {
    return prisma.trainingAssignment.update({
      where: { trainingId_userId: { trainingId, userId } },
      data: {
        completionStatus: 'COMPLETED',
        completionDate: new Date(),
        score: data?.score ? Number(data.score) : undefined,
        certificateUrl: data?.certificateUrl ?? undefined,
        remarks: data?.remarks ?? undefined,
      },
    });
  }

  async listByUser(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const where = { userId } as Prisma.TrainingAssignmentWhereInput;
    const [items, total] = await Promise.all([
      prisma.trainingAssignment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { assignedDate: 'desc' },
        include: { training: { include: { department: true } } },
      }),
      prisma.trainingAssignment.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async listAssignments(trainingId: string) {
    return prisma.trainingAssignment.findMany({
      where: { trainingId },
      orderBy: { assignedDate: 'desc' },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
  }
}

export const trainingRepository = new TrainingRepository();
