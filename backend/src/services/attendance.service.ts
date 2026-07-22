import { prisma } from '../config/prisma.js';

export class AttendanceService {
  async getAttendanceReport() {
    return prisma.attendance.findMany({
      include: { user: true },
      orderBy: { date: 'desc' },
    });
  }

  async markAttendance(userId: string, status: string) {
    return prisma.attendance.create({
      data: {
        userId,
        date: new Date(),
        status: status as any,
      },
    });
  }
}
