import type { Request, Response } from 'express';
import { leaveService } from '../services/leave.service.js';
import { buildApiResponse } from '../utils/api-response.js';
import { logger } from '../utils/logger.js';

export const createLeave = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id as string;
    const leave = await leaveService.createLeave(userId, req.body);
    logger.info(`Leave request created for user ${userId}: ${leave.id}`);
    return res.status(201).json(buildApiResponse('Leave request submitted successfully', leave));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create leave request';
    logger.error(`Error creating leave request: ${errorMessage}`);
    return res.status(400).json(buildApiResponse(errorMessage, null, [errorMessage]));
  }
};

export const getAllLeaves = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id as string;
    const role = (req as any).user.role as string;
    const page = Math.max(1, parseInt(req.query.page as unknown as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as unknown as string) || 10));
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

    const filters = {
      q: req.query.q as string | undefined,
      leaveType: req.query.leaveType as string | undefined,
      status: req.query.status as string | undefined,
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
      employeeId: req.query.employeeId as string | undefined,
    };

    const result = await leaveService.getAllLeaves(userId, role, filters, page, limit, sortBy, sortOrder);
    logger.info(`Fetched ${result.leaves.length} leave requests`);
    return res.status(200).json(buildApiResponse('Leave requests retrieved successfully', result));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch leave requests';
    logger.error(`Error fetching leave requests: ${errorMessage}`);
    return res.status(400).json(buildApiResponse(errorMessage, null, [errorMessage]));
  }
};

export const getLeaveById = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const userId = (req as any).user.id as string;
    const role = (req as any).user.role as string;
    const leave = await leaveService.getLeaveById(id, userId, role);
    logger.info(`Retrieved leave request: ${id}`);
    return res.status(200).json(buildApiResponse('Leave request retrieved successfully', leave));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch leave request';
    logger.error(`Error fetching leave request: ${errorMessage}`);
    const statusCode = errorMessage.includes('not found') ? 404 : errorMessage.includes('forbidden') ? 403 : 400;
    return res.status(statusCode).json(buildApiResponse(errorMessage, null, [errorMessage]));
  }
};

export const updateLeave = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const userId = (req as any).user.id as string;
    const role = (req as any).user.role as string;
    const leave = await leaveService.updateLeave(id, userId, role, req.body);
    logger.info(`Updated leave request: ${id}`);
    return res.status(200).json(buildApiResponse('Leave request updated successfully', leave));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update leave request';
    logger.error(`Error updating leave request: ${errorMessage}`);
    const statusCode = errorMessage.includes('not found') ? 404 : errorMessage.includes('forbidden') ? 403 : 400;
    return res.status(statusCode).json(buildApiResponse(errorMessage, null, [errorMessage]));
  }
};

export const deleteLeave = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const leave = await leaveService.deleteLeave(id);
    logger.info(`Deleted leave request: ${id}`);
    return res.status(200).json(buildApiResponse('Leave request deleted successfully', leave));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete leave request';
    logger.error(`Error deleting leave request: ${errorMessage}`);
    const statusCode = errorMessage.includes('not found') ? 404 : 400;
    return res.status(statusCode).json(buildApiResponse(errorMessage, null, [errorMessage]));
  }
};

export const approveLeave = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const approvedById = (req as any).user.id as string;
    const leave = await leaveService.approveLeave(id, approvedById, req.body.remarks as string | undefined);
    logger.info(`Approved leave request: ${id}`);
    return res.status(200).json(buildApiResponse('Leave request approved successfully', leave));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to approve leave request';
    logger.error(`Error approving leave request: ${errorMessage}`);
    const statusCode = errorMessage.includes('not found') ? 404 : 400;
    return res.status(statusCode).json(buildApiResponse(errorMessage, null, [errorMessage]));
  }
};

export const rejectLeave = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const approvedById = (req as any).user.id as string;
    const leave = await leaveService.rejectLeave(id, approvedById, req.body.remarks as string | undefined);
    logger.info(`Rejected leave request: ${id}`);
    return res.status(200).json(buildApiResponse('Leave request rejected successfully', leave));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to reject leave request';
    logger.error(`Error rejecting leave request: ${errorMessage}`);
    const statusCode = errorMessage.includes('not found') ? 404 : 400;
    return res.status(statusCode).json(buildApiResponse(errorMessage, null, [errorMessage]));
  }
};

export const getMyLeaves = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id as string;
    const page = Math.max(1, parseInt(req.query.page as unknown as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as unknown as string) || 10));
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

    const filters = {
      q: req.query.q as string | undefined,
      leaveType: req.query.leaveType as string | undefined,
      status: req.query.status as string | undefined,
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
    };

    const result = await leaveService.getMyLeaves(userId, filters, page, limit, sortBy, sortOrder);
    logger.info(`Fetched ${result.leaves.length} leaves for user ${userId}`);
    return res.status(200).json(buildApiResponse('My leave requests retrieved successfully', result));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch my leave requests';
    logger.error(`Error fetching my leave requests: ${errorMessage}`);
    return res.status(400).json(buildApiResponse(errorMessage, null, [errorMessage]));
  }
};

export const getLeavesByEmployee = async (req: Request, res: Response) => {
  try {
    const employeeId = Array.isArray(req.params.employeeId) ? req.params.employeeId[0] : req.params.employeeId;
    const page = Math.max(1, parseInt(req.query.page as unknown as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as unknown as string) || 10));
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

    const filters = {
      q: req.query.q as string | undefined,
      leaveType: req.query.leaveType as string | undefined,
      status: req.query.status as string | undefined,
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
    };

    const result = await leaveService.getLeavesByEmployee(employeeId, filters, page, limit, sortBy, sortOrder);
    logger.info(`Fetched ${result.leaves.length} leaves for employee ${employeeId}`);
    return res.status(200).json(buildApiResponse('Employee leave requests retrieved successfully', result));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch employee leaves';
    logger.error(`Error fetching employee leaves: ${errorMessage}`);
    return res.status(400).json(buildApiResponse(errorMessage, null, [errorMessage]));
  }
};

export const getMonthlyLeaveReport = async (req: Request, res: Response) => {
  try {
    const month = Math.max(1, Math.min(12, parseInt(req.query.month as unknown as string) || new Date().getMonth() + 1));
    const year = Math.max(2000, parseInt(req.query.year as unknown as string) || new Date().getFullYear());
    const employeeId = req.query.employeeId as string | undefined;

    const report = await leaveService.getMonthlyLeaveReport(month, year, employeeId);
    logger.info(`Generated monthly leave report for ${month}/${year}`);
    return res.status(200).json(buildApiResponse('Monthly leave report retrieved successfully', report));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate monthly leave report';
    logger.error(`Error generating monthly leave report: ${errorMessage}`);
    return res.status(400).json(buildApiResponse(errorMessage, null, [errorMessage]));
  }
};
