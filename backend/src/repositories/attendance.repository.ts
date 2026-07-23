import { prisma } from '../config/prisma.js';
import { Attendance, Prisma } from '@prisma/client';

export class AttendanceRepository {
  async findAll(
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'date',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<{ attendances: Attendance[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    const [attendances, total] = await Promise.all([
      prisma.attendance.findMany({
        skip,
        take: limit,
        include: {
          user: true,
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      prisma.attendance.count(),
    ]);

    return { attendances, total, page, limit };
  }

  async findById(id: string): Promise<Attendance | null> {
    return prisma.attendance.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });
  }

  async findByEmployee(
    userId: string,
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'date',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<{ attendances: Attendance[]; total: number }> {
    const skip = (page - 1) * limit;

    const [attendances, total] = await Promise.all([
      prisma.attendance.findMany({
        where: { userId },
        skip,
        take: limit,
        include: {
          user: true,
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      prisma.attendance.count({ where: { userId } }),
    ]);

    return { attendances, total };
  }

  async findByDate(
    date: Date,
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'date',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<{ attendances: Attendance[]; total: number }> {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const skip = (page - 1) * limit;

    const [attendances, total] = await Promise.all([
      prisma.attendance.findMany({
        where: {
          date: {
            gte: start,
            lte: end,
          },
        },
        skip,
        take: limit,
        include: {
          user: true,
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      prisma.attendance.count({
        where: {
          date: {
            gte: start,
            lte: end,
          },
        },
      }),
    ]);

    return { attendances, total };
  }

  async findByUserAndDate(userId: string, date: Date): Promise<Attendance | null> {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    return prisma.attendance.findFirst({
      where: {
        userId,
        date: {
          gte: start,
          lte: end,
        },
      },
      include: {
        user: true,
      },
    });
  }

  async search(
    query: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ attendances: Attendance[]; total: number }> {
    const skip = (page - 1) * limit;

    const [attendances, total] = await Promise.all([
      prisma.attendance.findMany({
        where: {
          OR: [
            { location: { contains: query, mode: 'insensitive' } },
            { status: { equals: query as any } },
            { user: { firstName: { contains: query, mode: 'insensitive' } } },
            { user: { lastName: { contains: query, mode: 'insensitive' } } },
            { user: { email: { contains: query, mode: 'insensitive' } } },
          ],
        },
        skip,
        take: limit,
        include: {
          user: true,
        },
        orderBy: {
          date: 'desc',
        },
      }),
      prisma.attendance.count({
        where: {
          OR: [
            { location: { contains: query, mode: 'insensitive' } },
            { status: { equals: query as any } },
            { user: { firstName: { contains: query, mode: 'insensitive' } } },
            { user: { lastName: { contains: query, mode: 'insensitive' } } },
            { user: { email: { contains: query, mode: 'insensitive' } } },
          ],
        },
      }),
    ]);

    return { attendances, total };
  }

  async filter(
    filters: {
      userId?: string;
      status?: string;
      date?: string;
    },
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'date',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<{ attendances: Attendance[]; total: number }> {
    const skip = (page - 1) * limit;

    const whereClause: Prisma.AttendanceWhereInput = {
      ...(filters.userId && { userId: filters.userId }),
      ...(filters.status && { status: filters.status as any }),
      ...(filters.date && {
        date: {
          gte: new Date(filters.date),
          lt: new Date(new Date(filters.date).getTime() + 24 * 60 * 60 * 1000),
        },
      }),
    };

    const [attendances, total] = await Promise.all([
      prisma.attendance.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          user: true,
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      prisma.attendance.count({ where: whereClause }),
    ]);

    return { attendances, total };
  }

  async create(data: Prisma.AttendanceCreateInput): Promise<Attendance> {
    return prisma.attendance.create({
      data,
      include: {
        user: true,
      },
    });
  }

  async update(id: string, data: Prisma.AttendanceUpdateInput): Promise<Attendance> {
    return prisma.attendance.update({
      where: { id },
      data,
      include: {
        user: true,
      },
    });
  }

  async delete(id: string): Promise<Attendance> {
    return prisma.attendance.delete({
      where: { id },
      include: {
        user: true,
      },
    });
  }
}

export const attendanceRepository = new AttendanceRepository();
