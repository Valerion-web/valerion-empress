import { prisma } from '../config/prisma.js';

export class DashboardService {
  async overview() {
    const [totalEmployees, totalDepartments, totalAssets, totalTrainings] = await Promise.all([
      prisma.user.count(),
      prisma.department.count(),
      prisma.asset.count(),
      prisma.training.count(),
    ]);

    // Payroll this month
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const payrollThisMonth = await prisma.payroll.aggregate({ where: { month, year }, _sum: { netSalary: true } });

    return { totalEmployees, totalDepartments, totalAssets, totalTrainings, payrollThisMonth: payrollThisMonth._sum.netSalary ?? 0 };
  }

  async employees(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      prisma.user.findMany({ skip, take: limit, select: { id: true, firstName: true, lastName: true, email: true, roleId: true, departmentId: true } }),
      prisma.user.count(),
    ]);

    // department-wise counts
    const deptCounts = await prisma.department.findMany({ select: { id: true, name: true, _count: { select: { users: true } } } });
    return { items, total, page, limit, departments: deptCounts.map(d => ({ id: d.id, name: d.name, count: d._count.users })) };
  }

  async attendance(months = 6) {
    const now = new Date();
    const results: Array<{ month: string; present: number; absent: number; late: number }> = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      const present = await prisma.attendance.count({ where: { date: { gte: start, lt: end }, status: 'PRESENT' } });
      const absent = await prisma.attendance.count({ where: { date: { gte: start, lt: end }, status: 'ABSENT' } });
      const late = await prisma.attendance.count({ where: { date: { gte: start, lt: end }, status: 'LATE' } });
      results.push({ month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, present, absent, late });
    }

    // department-wise recent month breakdown
    const recentStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const recentEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const deptAgg = await prisma.$queryRaw`
      SELECT d.id, d.name, SUM(CASE WHEN a.status = 'PRESENT' THEN 1 ELSE 0 END) as present, SUM(CASE WHEN a.status = 'ABSENT' THEN 1 ELSE 0 END) as absent
      FROM "public"."Attendance" a
      JOIN "public"."User" u ON u.id = a."userId"
      JOIN "public"."Department" d ON d.id = u."departmentId"
      WHERE a.date >= ${recentStart} AND a.date < ${recentEnd}
      GROUP BY d.id, d.name
    `;

    return { monthly: results, departmentBreakdown: deptAgg };
  }

  async payroll(months = 6) {
    const now = new Date();
    const results: Array<{ month: string; totalPaid: number }> = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      const agg = await prisma.payroll.aggregate({ where: { month: m, year: y, paymentStatus: 'PAID' }, _sum: { netSalary: true } });
      results.push({ month: `${y}-${String(m).padStart(2, '0')}`, totalPaid: Number(agg._sum.netSalary ?? 0) });
    }
    return { monthly: results };
  }

  async recruitment() {
    const openPositions = await prisma.recruitment.aggregate({ _sum: { openPositions: true }, where: { status: 'OPEN' } });
    const hiresThisMonth = await prisma.candidate.count({ where: { createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }, }, });
    return { openPositions: Number(openPositions._sum.openPositions ?? 0), hiresThisMonth };
  }

  async training() {
    const totalTrainings = await prisma.training.count();
    const assignments = await prisma.trainingAssignment.aggregate({ _count: { _all: true } });
    const completed = await prisma.trainingAssignment.count({ where: { completionStatus: 'COMPLETED' } });
    const completionRate = assignments._count._all ? (completed / assignments._count._all) * 100 : 0;
    return { totalTrainings, assignments: assignments._count._all, completed, completionRate: Number(completionRate.toFixed(2)) };
  }

  async assets() {
    const byStatus = await prisma.asset.groupBy({ by: ['status'], _count: { _all: true } });
    return { byStatus: byStatus.map(b => ({ status: b.status, count: b._count._all })) };
  }
}

export const dashboardService = new DashboardService();

