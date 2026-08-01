import { prisma } from '../config/prisma.js';
import { Leave, Prisma } from '@prisma/client';

export class LeaveRepository {
  async findAll(
    filters: {
      q?: string;
      leaveType?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
      employeeId?: string;
    },
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<{ leaves: Leave[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    const where: Prisma.LeaveWhereInput = {
      deletedAt: null,
      ...(filters.employeeId && { userId: filters.employeeId }),
      ...(filters.leaveType && { leaveType: filters.leaveType as any }),
      ...(filters.status && { status: filters.status as any }),
    };

    const dateFilters: Prisma.LeaveWhereInput[] = [];
    if (filters.startDate) {
      dateFilters.push({ startDate: { gte: new Date(filters.startDate) } });
    }
    if (filters.endDate) {
      dateFilters.push({ endDate: { lte: new Date(filters.endDate) } });
    }

    const andFilters: Prisma.LeaveWhereInput[] = [...dateFilters];

    if (filters.q) {
      andFilters.push({
        OR: [
          { reason: { contains: filters.q, mode: 'insensitive' } },
          { remarks: { contains: filters.q, mode: 'insensitive' } },
          { user: { firstName: { contains: filters.q, mode: 'insensitive' } } },
          { user: { lastName: { contains: filters.q, mode: 'insensitive' } } },
          { user: { email: { contains: filters.q, mode: 'insensitive' } } },
        ],
      });
    }

    if (andFilters.length) {
      where.AND = andFilters;
    }

    const [leaves, total] = await Promise.all([
      prisma.leave.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: true,
          approvedBy: true,
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      prisma.leave.count({ where }),
    ]);

    return { leaves, total, page, limit };
  }

  async findById(id: string): Promise<Leave | null> {
    return prisma.leave.findUnique({
      where: { id },
      include: {
        user: true,
        approvedBy: true,
      },
    });
  }

  async findOverlap(userId: string, startDate: Date, endDate: Date, excludeId?: string) {
    return prisma.leave.findFirst({
      where: {
        userId,
        deletedAt: null,
        ...(excludeId && { NOT: { id: excludeId } }),
        AND: [
          { startDate: { lte: endDate } },
          { endDate: { gte: startDate } },
        ],
      },
    });
  }

  async create(data: Prisma.LeaveCreateInput): Promise<Leave> {
    return prisma.leave.create({
      data,
      include: {
        user: true,
        approvedBy: true,
      },
    });
  }

  async update(id: string, data: Prisma.LeaveUpdateInput): Promise<Leave> {
    return prisma.leave.update({
      where: { id },
      data,
      include: {
        user: true,
        approvedBy: true,
      },
    });
  }

  async softDelete(id: string): Promise<Leave> {
    return prisma.leave.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: 'CANCELLED',
      },
      include: {
        user: true,
        approvedBy: true,
      },
    });
  }

  async approve(id: string, approvedById: string, remarks?: string): Promise<Leave> {
    return prisma.leave.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedById,
        approvedAt: new Date(),
        remarks,
      },
      include: {
        user: true,
        approvedBy: true,
      },
    });
  }

  async reject(id: string, approvedById: string, remarks?: string): Promise<Leave> {
    return prisma.leave.update({
      where: { id },
      data: {
        status: 'REJECTED',
        approvedById,
        approvedAt: new Date(),
        remarks,
      },
      include: {
        user: true,
        approvedBy: true,
      },
    });
  }

  async getMonthlyReport(month: number, year: number, employeeId?: string) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const where: Prisma.LeaveWhereInput = {
      deletedAt: null,
      startDate: { gte: start },
      endDate: { lte: end },
      ...(employeeId && { userId: employeeId }),
    };

    const leaves = await prisma.leave.findMany({
      where,
      include: {
        user: true,
        approvedBy: true,
      },
      orderBy: {
        startDate: 'asc',
      },
    });

    const totalDays = leaves.reduce((sum, leave) => sum + leave.totalDays, 0);

    return {
      month,
      year,
      totalLeaves: leaves.length,
      totalDays,
      leaves,
    };
  }
}

export const leaveRepository = new LeaveRepository();
