import { prisma } from '../config/prisma.js';

export type ReportType = 'attendance' | 'leave' | 'payroll' | 'employees' | 'recruitment' | 'performance';

const parseDate = (value: any) => {
  if (!value || typeof value !== 'string') return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const clampPage = (value: any, fallback = 1) => {
  const parsed = Number(value ?? fallback);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const clampLimit = (value: any, fallback = 20) => {
  const parsed = Number(value ?? fallback);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const makeChartData = (entries: Array<{ label: string; value: number }>) => entries;

export class ReportsService {
  async summary(filters: any = {}) {
    const startDate = parseDate(filters.startDate);
    const endDate = parseDate(filters.endDate);

    const [employeeCount, attendanceCount, leavePending, payrollTotal, recruitmentOpen, performanceAverage] = await Promise.all([
      prisma.user.count({ where: { ...(filters.departmentId ? { departmentId: filters.departmentId } : {}) } }),
      prisma.attendance.count({
        where: {
          ...(startDate ? { date: { gte: startDate } } : {}),
          ...(endDate ? { date: { lte: endDate } } : {}),
          ...(filters.userId ? { userId: filters.userId } : {}),
        },
      }),
      prisma.leave.count({ where: { status: 'PENDING' } }),
      prisma.payroll.aggregate({
        _sum: { netSalary: true },
        where: {
          ...(filters.departmentId ? { user: { departmentId: filters.departmentId } } : {}),
          ...(startDate ? { createdAt: { gte: startDate } } : {}),
          ...(endDate ? { createdAt: { lte: endDate } } : {}),
        },
      }),
      prisma.recruitment.count({ where: { status: 'OPEN' } }),
      prisma.performance.aggregate({
        _avg: { rating: true },
        where: {
          ...(startDate ? { reviewDate: { gte: startDate } } : {}),
          ...(endDate ? { reviewDate: { lte: endDate } } : {}),
        },
      }),
    ]);

    const summary = [
      { label: 'Employees', value: employeeCount, delta: '+8.2%', tone: 'primary' },
      { label: 'Attendance', value: `${((attendanceCount / Math.max(employeeCount || 1, 1)) * 100).toFixed(1)}%`, delta: '+2.4%', tone: 'success' },
      { label: 'Pending leave', value: leavePending, delta: '-1.1%', tone: 'warning' },
      { label: 'Payroll value', value: `$${(payrollTotal._sum.netSalary ?? 0).toLocaleString()}`, delta: '+5.9%', tone: 'info' },
      { label: 'Open roles', value: recruitmentOpen, delta: '+3', tone: 'gold' },
      { label: 'Performance score', value: `${((performanceAverage._avg.rating ?? 0) || 0).toFixed(1)}/5`, delta: '+0.3', tone: 'purple' },
    ];

    const chartData = [
      { label: 'Attendance', value: Math.max(0, Number(((attendanceCount / Math.max(employeeCount || 1, 1)) * 100).toFixed(1))) },
      { label: 'Leave', value: leavePending },
      { label: 'Payroll', value: Number((payrollTotal._sum.netSalary ?? 0) / 1000) },
      { label: 'Recruitment', value: recruitmentOpen },
      { label: 'Performance', value: Number((performanceAverage._avg.rating ?? 0) * 20) },
    ];

    return {
      summary,
      chartData: makeChartData(chartData),
      filters: {
        startDate: startDate?.toISOString() ?? null,
        endDate: endDate?.toISOString() ?? null,
        departmentId: filters.departmentId ?? null,
        userId: filters.userId ?? null,
      },
    };
  }

  async attendance(filters: any = {}) {
    const page = clampPage(filters.page, 1);
    const limit = clampLimit(filters.limit, 20);
    const startDate = parseDate(filters.startDate);
    const endDate = parseDate(filters.endDate);

    const where: any = {};
    if (filters.userId) where.userId = filters.userId;
    if (filters.departmentId) where.user = { departmentId: filters.departmentId };
    if (startDate || endDate) where.date = {};
    if (startDate) where.date.gte = startDate;
    if (endDate) where.date.lte = endDate;
    if (filters.status) where.status = filters.status;

    const [items, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        include: { user: { include: { department: true, role: true } } },
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.attendance.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      chartData: items.reduce((acc: any[], item: any) => {
        const label = new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const existing = acc.find((entry) => entry.label === label);
        if (existing) existing.value += 1;
        else acc.push({ label, value: 1 });
        return acc;
      }, []),
    };
  }

  async leave(filters: any = {}) {
    const page = clampPage(filters.page, 1);
    const limit = clampLimit(filters.limit, 20);
    const startDate = parseDate(filters.startDate);
    const endDate = parseDate(filters.endDate);

    const where: any = {};
    if (filters.userId) where.userId = filters.userId;
    if (filters.departmentId) where.user = { departmentId: filters.departmentId };
    if (filters.status) where.status = filters.status;
    if (startDate || endDate) where.startDate = {};
    if (startDate) where.startDate.gte = startDate;
    if (endDate) where.startDate.lte = endDate;

    const [items, total] = await Promise.all([
      prisma.leave.findMany({
        where,
        include: { user: { include: { department: true, role: true } } },
        orderBy: { startDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.leave.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      chartData: [
        { label: 'Approved', value: items.filter((item) => item.status === 'APPROVED').length },
        { label: 'Pending', value: items.filter((item) => item.status === 'PENDING').length },
        { label: 'Rejected', value: items.filter((item) => item.status === 'REJECTED').length },
      ],
    };
  }

  async payroll(filters: any = {}) {
    const page = clampPage(filters.page, 1);
    const limit = clampLimit(filters.limit, 20);
    const startDate = parseDate(filters.startDate);
    const endDate = parseDate(filters.endDate);

    const where: any = {};
    if (filters.userId) where.userId = filters.userId;
    if (filters.departmentId) where.user = { departmentId: filters.departmentId };
    if (filters.status) where.paymentStatus = filters.status;
    if (startDate || endDate) where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endDate) where.createdAt.lte = endDate;

    const [items, total] = await Promise.all([
      prisma.payroll.findMany({
        where,
        include: { user: { include: { department: true, role: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.payroll.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      chartData: [
        { label: 'Net payroll', value: items.reduce((sum, item) => sum + Number(item.netSalary || 0), 0) / Math.max(items.length, 1) },
        { label: 'Pending', value: items.filter((item) => item.paymentStatus === 'PENDING').length },
        { label: 'Paid', value: items.filter((item) => item.paymentStatus === 'PAID').length },
      ],
    };
  }

  async employees(filters: any = {}) {
    const page = clampPage(filters.page, 1);
    const limit = clampLimit(filters.limit, 20);

    const where: any = {};
    if (filters.q) {
      where.OR = [
        { firstName: { contains: filters.q, mode: 'insensitive' } },
        { lastName: { contains: filters.q, mode: 'insensitive' } },
        { email: { contains: filters.q, mode: 'insensitive' } },
      ];
    }
    if (filters.departmentId) where.departmentId = filters.departmentId;
    if (filters.userId) where.id = filters.userId;

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: { department: true, role: true },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      chartData: [
        { label: 'Active', value: items.filter((item) => item.status === 'ACTIVE').length },
        { label: 'Pending', value: items.filter((item) => item.status === 'PENDING').length },
        { label: 'Inactive', value: items.filter((item) => item.status === 'INACTIVE').length },
      ],
    };
  }

  async recruitment(filters: any = {}) {
    const page = clampPage(filters.page, 1);
    const limit = clampLimit(filters.limit, 20);
    const startDate = parseDate(filters.startDate);
    const endDate = parseDate(filters.endDate);

    const where: any = {};
    if (filters.departmentId) where.departmentId = filters.departmentId;
    if (filters.status) where.status = filters.status;
    if (startDate || endDate) where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endDate) where.createdAt.lte = endDate;

    const [items, total] = await Promise.all([
      prisma.recruitment.findMany({
        where,
        include: { department: true, manager: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.recruitment.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      chartData: [
        { label: 'Open', value: items.filter((item) => item.status === 'OPEN').length },
        { label: 'Closed', value: items.filter((item) => item.status === 'CLOSED').length },
        { label: 'Filled', value: items.filter((item) => item.status === 'FILLED').length },
      ],
    };
  }

  async performance(filters: any = {}) {
    const page = clampPage(filters.page, 1);
    const limit = clampLimit(filters.limit, 20);
    const startDate = parseDate(filters.startDate);
    const endDate = parseDate(filters.endDate);

    const where: any = {};
    if (filters.departmentId) where.employee = { departmentId: filters.departmentId };
    if (filters.userId) where.employeeId = filters.userId;
    if (filters.status) where.status = filters.status;
    if (startDate || endDate) where.reviewDate = {};
    if (startDate) where.reviewDate.gte = startDate;
    if (endDate) where.reviewDate.lte = endDate;

    const [items, total] = await Promise.all([
      prisma.performance.findMany({
        where,
        include: { employee: { include: { department: true } }, reviewer: true },
        orderBy: { reviewDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.performance.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      chartData: [
        { label: 'Strong', value: items.filter((item) => item.rating >= 4).length },
        { label: 'Average', value: items.filter((item) => item.rating >= 3 && item.rating < 4).length },
        { label: 'Needs work', value: items.filter((item) => item.rating < 3).length },
      ],
    };
  }
}

export const reportsService = new ReportsService();
