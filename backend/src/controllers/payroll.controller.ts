import { Request, Response } from 'express';
import { payrollService } from '../services/payroll.service.js';
import { buildApiResponse } from '../utils/api-response.js';
import { logger } from '../utils/logger.js';

export const createPayroll = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const payroll = await payrollService.createPayroll({
      userId: data.userId,
      basicSalary: data.basicSalary,
      allowances: data.allowances,
      deductions: data.deductions,
      bonus: data.bonus,
      month: data.month,
      year: data.year,
      paymentStatus: data.paymentStatus,
      paymentDate: data.paymentDate,
    });
    logger.info(`Payroll created: ${payroll.id}`);
    return res.status(201).json(buildApiResponse('Payroll created successfully', payroll));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create payroll';
    logger.error(`Error creating payroll: ${errorMessage}`);
    return res.status(400).json(buildApiResponse(errorMessage, null, [errorMessage]));
  }
};

export const getAllPayrolls = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 10));
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

    const filters = {
      q: req.query.q as string | undefined,
      paymentStatus: req.query.paymentStatus as string | undefined,
      month: req.query.month as unknown as number | undefined,
      year: req.query.year as unknown as number | undefined,
      employeeId: req.query.employeeId as string | undefined,
    };

    const result = await payrollService.getAllPayrolls(filters, page, limit, sortBy, sortOrder);
    logger.info(`Fetched ${result.payrolls.length} payroll records`);
    return res.status(200).json(buildApiResponse('Payroll records retrieved successfully', result));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch payroll records';
    logger.error(`Error fetching payroll records: ${errorMessage}`);
    return res.status(400).json(buildApiResponse(errorMessage, null, [errorMessage]));
  }
};

export const getPayrollById = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const payroll = await payrollService.getPayrollById(id);
    const user = (req as any).user;
    if (user.role === 'EMPLOYEE' && user.id !== payroll.userId) {
      return res.status(403).json(buildApiResponse('Forbidden', null, ['Insufficient permissions']));
    }
    logger.info(`Fetched payroll by id: ${id}`);
    return res.status(200).json(buildApiResponse('Payroll retrieved successfully', payroll));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch payroll';
    logger.error(`Error fetching payroll: ${errorMessage}`);
    const statusCode = errorMessage.includes('not found') ? 404 : 400;
    return res.status(statusCode).json(buildApiResponse(errorMessage, null, [errorMessage]));
  }
};

export const updatePayroll = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const payroll = await payrollService.updatePayroll(id, req.body);
    logger.info(`Updated payroll: ${id}`);
    return res.status(200).json(buildApiResponse('Payroll updated successfully', payroll));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update payroll';
    logger.error(`Error updating payroll: ${errorMessage}`);
    const statusCode = errorMessage.includes('not found') ? 404 : 400;
    return res.status(statusCode).json(buildApiResponse(errorMessage, null, [errorMessage]));
  }
};

export const deletePayroll = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await payrollService.deletePayroll(id);
    logger.info(`Deleted payroll: ${id}`);
    return res.status(200).json(buildApiResponse('Payroll deleted successfully', null));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete payroll';
    logger.error(`Error deleting payroll: ${errorMessage}`);
    const statusCode = errorMessage.includes('not found') ? 404 : 400;
    return res.status(statusCode).json(buildApiResponse(errorMessage, null, [errorMessage]));
  }
};

export const getPayrollByEmployee = async (req: Request, res: Response) => {
  try {
    const employeeId = Array.isArray(req.params.employeeId) ? req.params.employeeId[0] : req.params.employeeId;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 10));
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

    const user = (req as any).user;
    if (user.role === 'EMPLOYEE' && user.id !== employeeId) {
      return res.status(403).json(buildApiResponse('Forbidden', null, ['Insufficient permissions']));
    }

    const result = await payrollService.getPayrollByEmployee(employeeId, page, limit, sortBy, sortOrder);
    logger.info(`Fetched payroll records for employee: ${employeeId}`);
    return res.status(200).json(buildApiResponse('Employee payroll retrieved successfully', result));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch employee payroll';
    logger.error(`Error fetching employee payroll: ${errorMessage}`);
    return res.status(400).json(buildApiResponse(errorMessage, null, [errorMessage]));
  }
};

export const getMonthlyPayroll = async (req: Request, res: Response) => {
  try {
    const month = Math.max(1, Math.min(12, parseInt(req.query.month as string) || new Date().getMonth() + 1));
    const year = Math.max(2000, parseInt(req.query.year as string) || new Date().getFullYear());
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 10));
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

    const result = await payrollService.getMonthlyPayroll(month, year, page, limit, sortBy, sortOrder);
    logger.info(`Fetched monthly payroll for ${month}/${year}`);
    return res.status(200).json(buildApiResponse('Monthly payroll retrieved successfully', result));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch monthly payroll';
    logger.error(`Error fetching monthly payroll: ${errorMessage}`);
    return res.status(400).json(buildApiResponse(errorMessage, null, [errorMessage]));
  }
};

export const getYearlyPayroll = async (req: Request, res: Response) => {
  try {
    const year = Math.max(2000, parseInt(req.query.year as string) || new Date().getFullYear());
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 10));
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

    const result = await payrollService.getYearlyPayroll(year, page, limit, sortBy, sortOrder);
    logger.info(`Fetched yearly payroll for ${year}`);
    return res.status(200).json(buildApiResponse('Yearly payroll retrieved successfully', result));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch yearly payroll';
    logger.error(`Error fetching yearly payroll: ${errorMessage}`);
    return res.status(400).json(buildApiResponse(errorMessage, null, [errorMessage]));
  }
};
