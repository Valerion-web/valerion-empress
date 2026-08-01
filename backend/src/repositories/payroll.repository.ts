import { prisma } from '../config/prisma.js';
import { Payroll, Prisma } from '@prisma/client';

export class PayrollRepository {
  async create(data: any): Promise<Payroll> {
    return prisma.payroll.create({ data, include: { user: true } });
  }

  async update(id: string, data: any): Promise<Payroll> {
    return prisma.payroll.update({ where: { id }, data, include: { user: true } });
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.payroll.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async findById(id: string): Promise<Payroll | null> {
    return prisma.payroll.findUnique({ where: { id }, include: { user: true } });
  }

  async findByEmployee(
    employeeId: string,
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<{ payrolls: Payroll[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const [payrolls, total] = await Promise.all([
      prisma.payroll.findMany({
        where: { userId: employeeId },
        skip,
        take: limit,
        include: { user: true },
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.payroll.count({ where: { userId: employeeId } }),
    ]);

    return { payrolls, total, page, limit };
  }

  async findMonthly(
    month: number,
    year: number,
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<{ payrolls: Payroll[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const [payrolls, total] = await Promise.all([
      prisma.payroll.findMany({
        where: { month, year },
        skip,
        take: limit,
        include: { user: true },
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.payroll.count({ where: { month, year } }),
    ]);

    return { payrolls, total, page, limit };
  }

  async findYearly(
    year: number,
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<{ payrolls: Payroll[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const [payrolls, total] = await Promise.all([
      prisma.payroll.findMany({
        where: { year },
        skip,
        take: limit,
        include: { user: true },
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.payroll.count({ where: { year } }),
    ]);

    return { payrolls, total, page, limit };
  }

  async search(
    query: string,
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<{ payrolls: Payroll[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const where: Prisma.PayrollWhereInput = {
      OR: [
        { paymentStatus: query as any },
        { user: { firstName: { contains: query, mode: 'insensitive' } } },
        { user: { lastName: { contains: query, mode: 'insensitive' } } },
        { user: { email: { contains: query, mode: 'insensitive' } } },
      ],
    };

    const [payrolls, total] = await Promise.all([
      prisma.payroll.findMany({
        where,
        skip,
        take: limit,
        include: { user: true },
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.payroll.count({ where }),
    ]);

    return { payrolls, total, page, limit };
  }

  async findAll(
    filters: {
      q?: string;
      paymentStatus?: string;
      month?: number;
      year?: number;
      employeeId?: string;
    },
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<{ payrolls: Payroll[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const where: Prisma.PayrollWhereInput = {
      ...(filters.paymentStatus && { paymentStatus: filters.paymentStatus as any }),
      ...(filters.month && { month: filters.month }),
      ...(filters.year && { year: filters.year }),
      ...(filters.employeeId && { userId: filters.employeeId }),
    };

    if (filters.q) {
      where.OR = [
        { user: { firstName: { contains: filters.q, mode: 'insensitive' } } },
        { user: { lastName: { contains: filters.q, mode: 'insensitive' } } },
        { user: { email: { contains: filters.q, mode: 'insensitive' } } },
      ];
    }

    const [payrolls, total] = await Promise.all([
      prisma.payroll.findMany({
        where,
        skip,
        take: limit,
        include: { user: true },
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.payroll.count({ where }),
    ]);

    return { payrolls, total, page, limit };
  }
}

export const payrollRepository = new PayrollRepository();
