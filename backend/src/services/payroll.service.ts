import { payrollRepository } from '../repositories/payroll.repository.js';
import { notificationService } from './notification.service.js';
import { logger } from '../utils/logger.js';

export class PayrollService {
  async createPayroll(data: {
    userId: string;
    basicSalary: number;
    allowances?: number;
    deductions?: number;
    bonus?: number;
    month: number;
    year: number;
    paymentStatus?: 'PENDING' | 'PAID';
    paymentDate?: Date;
  }) {
    const netSalary = data.basicSalary + (data.allowances ?? 0) + (data.bonus ?? 0) - (data.deductions ?? 0);
    if (netSalary < 0) {
      throw new Error('Net salary cannot be negative');
    }

    const payroll = await payrollRepository.create({
      user: { connect: { id: data.userId } },
      basicSalary: data.basicSalary,
      allowances: data.allowances ?? 0,
      deductions: data.deductions ?? 0,
      bonus: data.bonus ?? 0,
      netSalary,
      month: data.month,
      year: data.year,
      paymentStatus: data.paymentStatus ?? 'PENDING',
      paymentDate: data.paymentDate,
    });

    logger.info(`Created payroll for user ${data.userId} for ${data.month}/${data.year}`);
    await notificationService.sendToEmployee(data.userId, 'Payroll generated', `Payroll for ${data.month}/${data.year} has been generated and is ready for review.`, 'INFO', { payrollId: payroll.id, month: data.month, year: data.year });
    return payroll;
  }

  async updatePayroll(id: string, data: Partial<{
    basicSalary: number;
    allowances: number;
    deductions: number;
    bonus: number;
    month: number;
    year: number;
    paymentStatus: 'PENDING' | 'PAID';
    paymentDate: Date;
  }>) {
    const existing = await payrollRepository.findById(id);
    if (!existing) {
      throw new Error('Payroll not found');
    }

    const updatedData: any = {
      ...data,
    };

    if (data.basicSalary !== undefined) {
      updatedData.basicSalary = data.basicSalary;
    }
    if (data.allowances !== undefined) {
      updatedData.allowances = data.allowances;
    }
    if (data.deductions !== undefined) {
      updatedData.deductions = data.deductions;
    }
    if (data.bonus !== undefined) {
      updatedData.bonus = data.bonus;
    }
    if (
      data.basicSalary !== undefined ||
      data.allowances !== undefined ||
      data.deductions !== undefined ||
      data.bonus !== undefined
    ) {
      const basicSalary = data.basicSalary ?? existing.basicSalary;
      const allowances = data.allowances ?? existing.allowances;
      const deductions = data.deductions ?? existing.deductions;
      const bonus = data.bonus ?? existing.bonus;
      const netSalary = basicSalary + allowances + bonus - deductions;
      if (netSalary < 0) {
        throw new Error('Net salary cannot be negative');
      }
      updatedData.netSalary = netSalary;
    }

    const payroll = await payrollRepository.update(id, updatedData);
    logger.info(`Updated payroll ${id}`);
    return payroll;
  }

  async deletePayroll(id: string) {
    const payroll = await payrollRepository.findById(id);
    if (!payroll) {
      throw new Error('Payroll not found');
    }
    const deleted = await payrollRepository.delete(id);
    if (!deleted) {
      throw new Error('Failed to delete payroll');
    }
    logger.info(`Deleted payroll ${id}`);
    return payroll;
  }

  async getPayrollById(id: string) {
    const payroll = await payrollRepository.findById(id);
    if (!payroll) {
      throw new Error('Payroll not found');
    }
    return payroll;
  }

  async getPayrollByEmployee(
    employeeId: string,
    page: number,
    limit: number,
    sortBy: string,
    sortOrder: 'asc' | 'desc'
  ) {
    return payrollRepository.findByEmployee(employeeId, page, limit, sortBy, sortOrder);
  }

  async getMonthlyPayroll(
    month: number,
    year: number,
    page: number,
    limit: number,
    sortBy: string,
    sortOrder: 'asc' | 'desc'
  ) {
    return payrollRepository.findMonthly(month, year, page, limit, sortBy, sortOrder);
  }

  async getYearlyPayroll(
    year: number,
    page: number,
    limit: number,
    sortBy: string,
    sortOrder: 'asc' | 'desc'
  ) {
    return payrollRepository.findYearly(year, page, limit, sortBy, sortOrder);
  }

  async searchPayroll(
    query: string,
    page: number,
    limit: number,
    sortBy: string,
    sortOrder: 'asc' | 'desc'
  ) {
    return payrollRepository.search(query, page, limit, sortBy, sortOrder);
  }

  async getAllPayrolls(
    filters: {
      q?: string;
      paymentStatus?: string;
      month?: number;
      year?: number;
      employeeId?: string;
    },
    page: number,
    limit: number,
    sortBy: string,
    sortOrder: 'asc' | 'desc'
  ) {
    return payrollRepository.findAll(filters, page, limit, sortBy, sortOrder);
  }
}

export const payrollService = new PayrollService();
