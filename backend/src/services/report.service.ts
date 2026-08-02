import { prisma } from '../config/prisma.js';

export class ReportService {
  async employees(filters: any) {
    const page = Number(filters.page || 1);
    const limit = Number(filters.limit || 50);
    const skip = (page - 1) * limit;
    const where: any = {};
    if (filters.q) where.OR = [{ firstName: { contains: filters.q, mode: 'insensitive' } }, { lastName: { contains: filters.q, mode: 'insensitive' } }, { email: { contains: filters.q, mode: 'insensitive' } }];
    if (filters.departmentId) where.departmentId = filters.departmentId;
    const [items, total] = await Promise.all([prisma.user.findMany({ where, skip, take: limit, include: { role: true, department: true } }), prisma.user.count({ where })]);
    return { items, total, page, limit };
  }

  async attendance(filters: any) {
    const page = Number(filters.page || 1);
    const limit = Number(filters.limit || 100);
    const skip = (page - 1) * limit;
    const where: any = {};
    if (filters.userId) where.userId = filters.userId;
    if (filters.startDate || filters.endDate) where.date = {} as any;
    if (filters.startDate) where.date.gte = new Date(filters.startDate);
    if (filters.endDate) where.date.lte = new Date(filters.endDate);
    const [items, total] = await Promise.all([prisma.attendance.findMany({ where, skip, take: limit, include: { user: true }, orderBy: { date: 'desc' } }), prisma.attendance.count({ where })]);
    return { items, total, page, limit };
  }

  async leaves(filters: any) {
    const page = Number(filters.page || 1);
    const limit = Number(filters.limit || 100);
    const skip = (page - 1) * limit;
    const where: any = {};
    if (filters.userId) where.userId = filters.userId;
    if (filters.status) where.status = filters.status;
    if (filters.startDate || filters.endDate) where.startDate = {} as any;
    if (filters.startDate) where.startDate.gte = new Date(filters.startDate);
    if (filters.endDate) where.startDate.lte = new Date(filters.endDate);
    const [items, total] = await Promise.all([prisma.leave.findMany({ where, skip, take: limit, include: { user: true }, orderBy: { startDate: 'desc' } }), prisma.leave.count({ where })]);
    return { items, total, page, limit };
  }

  async payroll(filters: any) {
    const page = Number(filters.page || 1);
    const limit = Number(filters.limit || 100);
    const skip = (page - 1) * limit;
    const where: any = {};
    if (filters.userId) where.userId = filters.userId;
    if (filters.startDate || filters.endDate) where.createdAt = {} as any;
    if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
    if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
    const [items, total] = await Promise.all([prisma.payroll.findMany({ where, skip, take: limit, include: { user: true }, orderBy: { createdAt: 'desc' } }), prisma.payroll.count({ where })]);
    return { items, total, page, limit };
  }

  async trainings(filters: any) {
    const page = Number(filters.page || 1);
    const limit = Number(filters.limit || 100);
    const skip = (page - 1) * limit;
    const where: any = {};
    if (filters.q) where.title = { contains: filters.q, mode: 'insensitive' };
    const [items, total] = await Promise.all([prisma.training.findMany({ where, skip, take: limit, include: { department: true } }), prisma.training.count({ where })]);
    return { items, total, page, limit };
  }

  async recruitment(filters: any) {
    const page = Number(filters.page || 1);
    const limit = Number(filters.limit || 100);
    const skip = (page - 1) * limit;
    const where: any = {};
    if (filters.status) where.status = filters.status;
    const [items, total] = await Promise.all([prisma.recruitment.findMany({ where, skip, take: limit, include: { department: true, manager: true } }), prisma.recruitment.count({ where })]);
    return { items, total, page, limit };
  }

  async assets(filters: any) {
    const page = Number(filters.page || 1);
    const limit = Number(filters.limit || 100);
    const skip = (page - 1) * limit;
    const where: any = {};
    if (filters.status) where.status = filters.status;
    const [items, total] = await Promise.all([prisma.asset.findMany({ where, skip, take: limit }), prisma.asset.count({ where })]);
    return { items, total, page, limit };
  }
}

export const reportService = new ReportService();
