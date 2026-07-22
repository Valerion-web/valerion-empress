import type { Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service.js';
import { buildApiResponse } from '../utils/api-response.js';

const dashboardService = new DashboardService();

export const getDashboard = async (req: Request, res: Response) => {
  const data = await dashboardService.getDashboard((req as any).user.role);
  res.json(buildApiResponse('Dashboard fetched', data));
};
