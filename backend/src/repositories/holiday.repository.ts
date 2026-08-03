import { prisma } from '../config/prisma.js';
import { Prisma } from '@prisma/client';

export class HolidayRepository {
  async create(data: Prisma.HolidayCreateInput) {
    return prisma.holiday.create({ data });
  }

  async list(params: { page: number; limit: number; search?: string; departmentId?: string; holidayType?: string; year?: number }) {
    const skip = (params.page - 1) * params.limit;
    const where: Prisma.HolidayWhereInput = {
      ...(params.departmentId ? { departmentId: params.departmentId } : {}),
      ...(params.holidayType ? { holidayType: params.holidayType as any } : {}),
      ...(params.year ? { holidayDate: { gte: new Date(`${params.year}-01-01T00:00:00.000Z`), lte: new Date(`${params.year}-12-31T23:59:59.999Z`) } } : {}),
      ...(params.search ? { OR: [{ name: { contains: params.search, mode: 'insensitive' as Prisma.QueryMode } }, { description: { contains: params.search, mode: 'insensitive' as Prisma.QueryMode } }] } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.holiday.findMany({ where, skip, take: params.limit, orderBy: { holidayDate: 'asc' }, include: { department: { select: { id: true, name: true } } } }),
      prisma.holiday.count({ where }),
    ]);

    return { items, total, page: params.page, limit: params.limit };
  }

  async getById(id: string) {
    return prisma.holiday.findUnique({ where: { id }, include: { department: { select: { id: true, name: true } } } });
  }

  async update(id: string, data: Prisma.HolidayUpdateInput) {
    return prisma.holiday.update({ where: { id }, data, include: { department: { select: { id: true, name: true } } } });
  }

  async delete(id: string) {
    return prisma.holiday.delete({ where: { id } });
  }

  async upcoming(limit = 5) {
    const now = new Date();
    return prisma.holiday.findMany({ where: { holidayDate: { gte: now } }, orderBy: { holidayDate: 'asc' }, take: limit, include: { department: { select: { id: true, name: true } } } });
  }

  async calendar(start: Date, end: Date) {
    return prisma.holiday.findMany({ where: { holidayDate: { gte: start, lte: end } }, orderBy: { holidayDate: 'asc' }, include: { department: { select: { id: true, name: true } } } });
  }

  async reports(params: { year?: number; departmentId?: string; holidayType?: string }) {
    const where: Prisma.HolidayWhereInput = {
      ...(params.departmentId ? { departmentId: params.departmentId } : {}),
      ...(params.holidayType ? { holidayType: params.holidayType as any } : {}),
      ...(params.year ? { holidayDate: { gte: new Date(`${params.year}-01-01T00:00:00.000Z`), lte: new Date(`${params.year}-12-31T23:59:59.999Z`) } } : {}),
    };

    return prisma.holiday.findMany({ where, orderBy: { holidayDate: 'asc' }, include: { department: { select: { id: true, name: true } } } });
  }
}

export const holidayRepository = new HolidayRepository();
