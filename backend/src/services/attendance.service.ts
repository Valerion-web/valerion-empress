import { Prisma } from '@prisma/client';
import { attendanceRepository } from '../repositories/attendance.repository.js';
import { logger } from '../utils/logger.js';
import { prisma } from '../config/prisma.js';

export class AttendanceService {
  constructor(private repository: typeof attendanceRepository) {}

  async getAllAttendance(
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'date',
    sortOrder: 'asc' | 'desc' = 'desc'
  ) {
    const result = await this.repository.findAll(page, limit, sortBy, sortOrder);
    logger.info(`Retrieved ${result.attendances.length} attendance records (Page: ${page}, Total: ${result.total})`);
    return result;
  }

  async getAttendanceById(id: string) {
    const attendance = await this.repository.findById(id);
    if (!attendance) {
      throw new Error('Attendance record not found');
    }
    logger.info(`Retrieved attendance: ${id}`);
    return attendance;
  }

  async getAttendanceByEmployee(
    userId: string,
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'date',
    sortOrder: 'asc' | 'desc' = 'desc'
  ) {
    const result = await this.repository.findByEmployee(userId, page, limit, sortBy, sortOrder);
    logger.info(`Retrieved ${result.attendances.length} attendance records for user ${userId}`);
    return result;
  }

  async getAttendanceByDate(
    date: Date,
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'date',
    sortOrder: 'asc' | 'desc' = 'desc'
  ) {
    const result = await this.repository.findByDate(date, page, limit, sortBy, sortOrder);
    logger.info(`Retrieved ${result.attendances.length} attendance records for date ${date.toISOString()}`);
    return result;
  }

  async getMonthlyAttendanceReport(month: number, year: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const attendances = await prisma.attendance.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
      include: {
        user: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    logger.info(`Generated monthly attendance report for ${month}/${year} with ${attendances.length} records`);
    return { month, year, total: attendances.length, attendances };
  }

  async searchAttendances(query: string, page: number = 1, limit: number = 10) {
    if (!query || query.trim().length === 0) {
      throw new Error('Search query cannot be empty');
    }

    const result = await this.repository.search(query, page, limit);
    logger.info(`Searched attendance with query "${query}": Found ${result.total}`);
    return result;
  }

  async filterAttendances(
    filters: { userId?: string; status?: string; date?: string },
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'date',
    sortOrder: 'asc' | 'desc' = 'desc'
  ) {
    const result = await this.repository.filter(filters, page, limit, sortBy, sortOrder);
    logger.info(`Filtered attendance: Found ${result.total}`);
    return result;
  }

  async checkIn(userId: string, data: { location?: string; status?: string }) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await this.repository.findByUserAndDate(userId, today);
    if (existing) {
      throw new Error('Attendance already checked in for today');
    }

    const attendance = await this.repository.create({
      user: { connect: { id: userId } },
      date: today,
      checkIn: new Date(),
      status: (data.status as any) || 'PRESENT',
      location: data.location,
    });

    logger.info(`Checked in attendance for user ${userId}`);
    return attendance;
  }

  async checkOut(id: string, data: { status?: string; location?: string }) {
    const attendance = await this.repository.findById(id);
    if (!attendance) {
      throw new Error('Attendance record not found');
    }

    const updated = await this.repository.update(id, {
      checkOut: new Date(),
      status: (data.status as any) || attendance.status,
      location: data.location ?? attendance.location,
    } as Prisma.AttendanceUpdateInput);

    logger.info(`Checked out attendance: ${id}`);
    return updated;
  }

  async updateAttendance(
    id: string,
    data: Partial<{
      userId: string;
      date: Date;
      checkIn: Date;
      checkOut: Date;
      status: string;
      location: string;
    }>
  ) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error('Attendance record not found');
    }

    if (!Object.keys(data).length) {
      throw new Error('At least one update field is required');
    }

    const attendance = await this.repository.update(id, data as Prisma.AttendanceUpdateInput);
    logger.info(`Updated attendance: ${id}`);
    return attendance;
  }

  async deleteAttendance(id: string) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error('Attendance record not found');
    }

    const attendance = await this.repository.delete(id);
    logger.info(`Deleted attendance: ${id}`);
    return attendance;
  }
}

export const attendanceService = new AttendanceService(attendanceRepository);
