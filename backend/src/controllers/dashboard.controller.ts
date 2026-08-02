import type { Request, Response } from 'express';
import { dashboardService } from '../services/dashboard.service.js';
import { buildApiResponse } from '../utils/api-response.js';

const parseIntOr = (v: any, def = 1) => (v ? parseInt(String(v), 10) : def);

export const overview = async (_req: Request, res: Response) => {
  try { return res.json(buildApiResponse('Overview retrieved', await dashboardService.overview())); } catch (e) { return res.status(500).json(buildApiResponse('Failed', null, [String(e)])); }
};

export const employees = async (req: Request, res: Response) => {
  try { const page = parseIntOr(req.query.page, 1); const limit = parseIntOr(req.query.limit, 20); return res.json(buildApiResponse('Employees retrieved', await dashboardService.employees(page, limit))); } catch (e) { return res.status(500).json(buildApiResponse('Failed', null, [String(e)])); }
};

export const attendance = async (req: Request, res: Response) => {
  try { const months = parseIntOr(req.query.months, 6); return res.json(buildApiResponse('Attendance retrieved', await dashboardService.attendance(months))); } catch (e) { return res.status(500).json(buildApiResponse('Failed', null, [String(e)])); }
};

export const payroll = async (req: Request, res: Response) => {
  try { const months = parseIntOr(req.query.months, 6); return res.json(buildApiResponse('Payroll retrieved', await dashboardService.payroll(months))); } catch (e) { return res.status(500).json(buildApiResponse('Failed', null, [String(e)])); }
};

export const recruitment = async (_req: Request, res: Response) => {
  try { return res.json(buildApiResponse('Recruitment retrieved', await dashboardService.recruitment())); } catch (e) { return res.status(500).json(buildApiResponse('Failed', null, [String(e)])); }
};

export const training = async (_req: Request, res: Response) => {
  try { return res.json(buildApiResponse('Training retrieved', await dashboardService.training())); } catch (e) { return res.status(500).json(buildApiResponse('Failed', null, [String(e)])); }
};

export const assets = async (_req: Request, res: Response) => {
  try { return res.json(buildApiResponse('Assets retrieved', await dashboardService.assets())); } catch (e) { return res.status(500).json(buildApiResponse('Failed', null, [String(e)])); }
};

