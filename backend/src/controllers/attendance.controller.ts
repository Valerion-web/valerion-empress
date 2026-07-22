import type { Request, Response } from 'express';
import { AttendanceService } from '../services/attendance.service.js';
import { buildApiResponse } from '../utils/api-response.js';

const attendanceService = new AttendanceService();

export const getAttendanceReport = async (_req: Request, res: Response) => {
  const data = await attendanceService.getAttendanceReport();
  res.json(buildApiResponse('Attendance report fetched', data));
};

export const markAttendance = async (req: Request, res: Response) => {
  const data = await attendanceService.markAttendance((req as any).user.id, req.body.status);
  res.json(buildApiResponse('Attendance marked', data));
};
