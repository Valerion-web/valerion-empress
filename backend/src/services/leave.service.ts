import { Prisma, LeaveType } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { LeaveRepository } from '../repositories/leave.repository.js';
import { logger } from '../utils/logger.js';

const leaveRepository = new LeaveRepository();

type LeaveFilters = {
  q?: string;
  leaveType?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  employeeId?: string;
};

type LeaveUpdateData = {
  leaveType?: LeaveType;
  startDate?: Date;
  endDate?: Date;
  reason?: string;
  remarks?: string;
};

export class LeaveService {
  private calculateTotalDays(startDate: Date, endDate: Date) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      throw new Error('Leave end date must be the same as or after start date');
    }

    if (start.getFullYear() !== end.getFullYear()) {
      throw new Error('Leave period must be within the same year');
    }

    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    return Math.floor((end.getTime() - start.getTime()) / millisecondsPerDay) + 1;
  }

  private async ensureLeaveBalance(userId: string, year: number) {
    return prisma.leaveBalance.upsert({
      where: {
        userId_year: {
          userId,
          year,
        },
      },
      create: {
        userId,
        year,
        annual: 12,
        used: 0,
        remaining: 12,
      },
      update: {},
    });
  }

  private async adjustLeaveBalance(
    userId: string,
    year: number,
    days: number,
    leaveType: string,
    reverse = false
  ) {
    if (leaveType === 'UNPAID') {
      return;
    }

    const balance = await this.ensureLeaveBalance(userId, year);
    const used = reverse ? balance.used - days : balance.used + days;
    const remaining = reverse ? balance.remaining + days : balance.remaining - days;

    if (used < 0 || remaining < 0) {
      throw new Error('Leave balance cannot be adjusted to a negative value');
    }

    await prisma.leaveBalance.update({
      where: {
        userId_year: {
          userId,
          year,
        },
      },
      data: {
        used,
        remaining,
      },
    });

    logger.info(`Leave balance updated for ${userId}/${year}: used=${used}, remaining=${remaining}`);
  }

  async createLeave(userId: string, data: { leaveType: LeaveType; startDate: string; endDate: string; reason: string; remarks?: string }) {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      throw new Error('Invalid leave date');
    }

    const totalDays = this.calculateTotalDays(startDate, endDate);
    const year = startDate.getFullYear();

    const overlap = await leaveRepository.findOverlap(userId, startDate, endDate);
    if (overlap) {
      throw new Error('Leave request overlaps with an existing leave');
    }

    if (data.leaveType !== 'UNPAID') {
      const balance = await this.ensureLeaveBalance(userId, year);
      if (balance.remaining < totalDays) {
        throw new Error('Insufficient leave balance for requested leave');
      }
    }

    const leave = await leaveRepository.create({
      user: { connect: { id: userId } },
      leaveType: data.leaveType,
      startDate,
      endDate,
      totalDays,
      reason: data.reason,
      remarks: data.remarks,
      status: 'PENDING',
    });

    return leave;
  }

  async getAllLeaves(
    userId: string,
    role: string,
    filters: LeaveFilters,
    page: number,
    limit: number,
    sortBy: string,
    sortOrder: 'asc' | 'desc'
  ) {
    const effectiveFilters: LeaveFilters = { ...filters };

    if (role === 'EMPLOYEE') {
      effectiveFilters.employeeId = userId;
    }

    const result = await leaveRepository.findAll(effectiveFilters, page, limit, sortBy, sortOrder);
    return result;
  }

  async getLeaveById(id: string, userId: string, role: string) {
    const leave = await leaveRepository.findById(id);
    if (!leave || leave.deletedAt) {
      throw new Error('Leave request not found');
    }

    if (role === 'EMPLOYEE' && leave.userId !== userId) {
      throw new Error('Forbidden: cannot access another user\'s leave request');
    }

    return leave;
  }

  async updateLeave(id: string, userId: string, role: string, data: LeaveUpdateData) {
    const existing = await leaveRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw new Error('Leave request not found');
    }

    if (existing.status !== 'PENDING') {
      throw new Error('Only pending leave requests can be updated');
    }

    if (role === 'EMPLOYEE' && existing.userId !== userId) {
      throw new Error('Forbidden: cannot update another user\'s leave request');
    }

    const updateData: Partial<Prisma.LeaveUpdateInput> = {};
    let totalDays = existing.totalDays;
    let startDate = existing.startDate;
    let endDate = existing.endDate;

    if (data.leaveType) {
      updateData.leaveType = data.leaveType as any;
    }

    if (data.startDate) {
      startDate = data.startDate;
      updateData.startDate = startDate;
    }

    if (data.endDate) {
      endDate = data.endDate;
      updateData.endDate = endDate;
    }

    if (startDate || endDate) {
      totalDays = this.calculateTotalDays(startDate, endDate);
      updateData.totalDays = totalDays;
    }

    if (data.reason) {
      updateData.reason = data.reason;
    }

    if (data.remarks) {
      updateData.remarks = data.remarks;
    }

    const overlap = await leaveRepository.findOverlap(existing.userId, startDate, endDate, id);
    if (overlap) {
      throw new Error('Updated leave period overlaps with an existing leave');
    }

    const leave = await leaveRepository.update(id, updateData);
    return leave;
  }

  async deleteLeave(id: string) {
    const existing = await leaveRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw new Error('Leave request not found');
    }

    if (existing.status === 'APPROVED' && existing.leaveType !== 'UNPAID') {
      this.adjustLeaveBalance(existing.userId, existing.startDate.getFullYear(), existing.totalDays, existing.leaveType, true);
    }

    const leave = await leaveRepository.softDelete(id);
    return leave;
  }

  async approveLeave(id: string, approvedById: string, remarks?: string) {
    const existing = await leaveRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw new Error('Leave request not found');
    }

    if (existing.status !== 'PENDING') {
      throw new Error('Only pending leave requests can be approved');
    }

    if (existing.leaveType !== 'UNPAID') {
      await this.adjustLeaveBalance(existing.userId, existing.startDate.getFullYear(), existing.totalDays, existing.leaveType, false);
    }

    const leave = await leaveRepository.approve(id, approvedById, remarks);
    return leave;
  }

  async rejectLeave(id: string, approvedById: string, remarks?: string) {
    const existing = await leaveRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw new Error('Leave request not found');
    }

    if (existing.status !== 'PENDING') {
      throw new Error('Only pending leave requests can be rejected');
    }

    const leave = await leaveRepository.reject(id, approvedById, remarks);
    return leave;
  }

  async getMyLeaves(
    userId: string,
    filters: LeaveFilters,
    page: number,
    limit: number,
    sortBy: string,
    sortOrder: 'asc' | 'desc'
  ) {
    const result = await leaveRepository.findAll({ ...filters, employeeId: userId }, page, limit, sortBy, sortOrder);
    return result;
  }

  async getLeavesByEmployee(
    employeeId: string,
    filters: LeaveFilters,
    page: number,
    limit: number,
    sortBy: string,
    sortOrder: 'asc' | 'desc'
  ) {
    const result = await leaveRepository.findAll({ ...filters, employeeId }, page, limit, sortBy, sortOrder);
    return result;
  }

  async getMonthlyLeaveReport(month: number, year: number, employeeId?: string) {
    const report = await leaveRepository.getMonthlyReport(month, year, employeeId);
    return report;
  }
}

export const leaveService = new LeaveService();
