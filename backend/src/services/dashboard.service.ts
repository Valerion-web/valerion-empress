import { prisma } from '../config/prisma.js';

export class DashboardService {
  async getDashboard(role: string) {
    const [employeeCount, leaveCount, payrollCount, ticketCount] = await Promise.all([
      prisma.user.count(),
      prisma.leave.count(),
      prisma.payroll.count(),
      prisma.helpdeskTicket.count(),
    ]);

    return {
      role,
      metrics: {
        employeeCount,
        leaveCount,
        payrollCount,
        ticketCount,
      },
    };
  }
}
