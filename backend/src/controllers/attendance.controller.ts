import type { Request, Response } from 'express';
import { attendanceService } from '../services/attendance.service.js';
import { buildApiResponse } from '../utils/api-response.js';
import { logger } from '../utils/logger.js';

export const getAllAttendance = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 10));
    const sortBy = (req.query.sortBy as string) || 'date';
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

    const result = await attendanceService.getAllAttendance(page, limit, sortBy, sortOrder);
    logger.info(`Fetched ${result.attendances.length} attendance records`);
    return res.status(200).json(buildApiResponse('Attendance records retrieved successfully', result));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch attendance records';
    logger.error(`Error fetching attendance records: ${errorMessage}`);
    return res.status(500).json(buildApiResponse(errorMessage, null, [errorMessage]));
  }
};

export const getAttendanceById = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const attendance = await attendanceService.getAttendanceById(id);
    logger.info(`Retrieved attendance: ${id}`);
    return res.status(200).json(buildApiResponse('Attendance record retrieved successfully', attendance));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch attendance record';
    logger.error(`Error fetching attendance record: ${errorMessage}`);
    const statusCode = errorMessage.includes('not found') ? 404 : 500;
    return res.status(statusCode).json(buildApiResponse(errorMessage, null, [errorMessage]));
  }
};

export const getAttendanceByEmployee = async (req: Request, res: Response) => {
  try {
    const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 10));
    const sortBy = (req.query.sortBy as string) || 'date';
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

    const result = await attendanceService.getAttendanceByEmployee(userId, page, limit, sortBy, sortOrder);
    logger.info(`Retrieved ${result.attendances.length} attendance records for user ${userId}`);
    return res.status(200).json(buildApiResponse('Employee attendance records retrieved successfully', result));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch employee attendance';
    logger.error(`Error fetching employee attendance: ${errorMessage}`);
    return res.status(400).json(buildApiResponse(errorMessage, null, [errorMessage]));
  }
};

export const getAttendanceByDate = async (req: Request, res: Response) => {
  try {
    const date = new Date(req.query.date as string);
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 10));
    const sortBy = (req.query.sortBy as string) || 'date';
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

    if (Number.isNaN(date.getTime())) {
      return res.status(400).json(buildApiResponse('Invalid attendance date', null, ['Invalid attendance date']));
    }

    const result = await attendanceService.getAttendanceByDate(date, page, limit, sortBy, sortOrder);
    logger.info(`Retrieved attendance records for date ${date.toISOString()}`);
    return res.status(200).json(buildApiResponse('Attendance records retrieved successfully', result));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch attendance by date';
    logger.error(`Error fetching attendance by date: ${errorMessage}`);
    return res.status(400).json(buildApiResponse(errorMessage, null, [errorMessage]));
  }
};

export const getMonthlyAttendanceReport = async (req: Request, res: Response) => {
  try {
    const month = Math.max(1, Math.min(12, parseInt(req.query.month as string) || new Date().getMonth() + 1));
    const year = Math.max(2000, parseInt(req.query.year as string) || new Date().getFullYear());

    const report = await attendanceService.getMonthlyAttendanceReport(month, year);
    logger.info(`Generated monthly attendance report for ${month}/${year}`);
    return res.status(200).json(buildApiResponse('Monthly attendance report retrieved successfully', report));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate monthly attendance report';
    logger.error(`Error generating monthly attendance report: ${errorMessage}`);
    return res.status(400).json(buildApiResponse(errorMessage, null, [errorMessage]));
  }
};

export const searchAttendances = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 10));

    if (!q || typeof q !== 'string') {
      return res.status(400).json(buildApiResponse('Search query (q) is required', null, ['Search query is required']));
    }

    const result = await attendanceService.searchAttendances(q, page, limit);
    logger.info(`Searched attendance with query "${q}": Found ${result.total}`);
    return res.status(200).json(buildApiResponse('Attendance records searched successfully', result));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to search attendance records';
    logger.error(`Error searching attendance records: ${errorMessage}`);
    return res.status(400).json(buildApiResponse(errorMessage, null, [errorMessage]));
  }
};

export const filterAttendances = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 10));
    const sortBy = (req.query.sortBy as string) || 'date';
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

    const filters = {
      userId: req.query.userId as string | undefined,
      status: req.query.status as string | undefined,
      date: req.query.date as string | undefined,
    };

    const result = await attendanceService.filterAttendances(filters, page, limit, sortBy, sortOrder);
    logger.info(`Filtered attendance records: Found ${result.total}`);
    return res.status(200).json(buildApiResponse('Attendance records filtered successfully', result));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to filter attendance records';
    logger.error(`Error filtering attendance records: ${errorMessage}`);
    return res.status(400).json(buildApiResponse(errorMessage, null, [errorMessage]));
  }
};

export const checkInAttendance = async (req: Request, res: Response) => {
  try {
    const attendance = await attendanceService.checkIn((req as any).user.id, req.body);
    logger.info(`Attendance checked in for user ${(req as any).user.id}`);
    return res.status(201).json(buildApiResponse('Attendance checked in successfully', attendance));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to check in attendance';
    logger.error(`Error checking in attendance: ${errorMessage}`);
    return res.status(400).json(buildApiResponse(errorMessage, null, [errorMessage]));
  }
};

export const checkOutAttendance = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const attendance = await attendanceService.checkOut(id, req.body);
    logger.info(`Attendance checked out: ${id}`);
    return res.status(200).json(buildApiResponse('Attendance checked out successfully', attendance));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to check out attendance';
    logger.error(`Error checking out attendance: ${errorMessage}`);
    const statusCode = errorMessage.includes('not found') ? 404 : 400;
    return res.status(statusCode).json(buildApiResponse(errorMessage, null, [errorMessage]));
  }
};

export const updateAttendance = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const attendance = await attendanceService.updateAttendance(id, req.body);
    logger.info(`Updated attendance: ${id}`);
    return res.status(200).json(buildApiResponse('Attendance updated successfully', attendance));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update attendance';
    logger.error(`Error updating attendance: ${errorMessage}`);
    const statusCode = errorMessage.includes('not found') ? 404 : 400;
    return res.status(statusCode).json(buildApiResponse(errorMessage, null, [errorMessage]));
  }
};

export const deleteAttendance = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await attendanceService.deleteAttendance(id);
    logger.info(`Deleted attendance: ${id}`);
    return res.status(200).json(buildApiResponse('Attendance deleted successfully', null));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete attendance';
    logger.error(`Error deleting attendance: ${errorMessage}`);
    const statusCode = errorMessage.includes('not found') ? 404 : 500;
    return res.status(statusCode).json(buildApiResponse(errorMessage, null, [errorMessage]));
  }
};
