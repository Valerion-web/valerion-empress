import type { Request, Response } from 'express';
import { LeaveService } from '../services/leave.service.js';
import { buildApiResponse } from '../utils/api-response.js';

const leaveService = new LeaveService();

export const requestLeave = async (req: Request, res: Response) => {
  const data = await leaveService.requestLeave((req as any).user.id, req.body);
  res.json(buildApiResponse('Leave requested', data));
};

export const listLeaves = async (req: Request, res: Response) => {
  const data = await leaveService.listLeaves((req as any).user.id);
  res.json(buildApiResponse('Leaves fetched', data));
};

export const approveLeave = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const data = await leaveService.approveLeave(id, (req as any).user.id);
  res.json(buildApiResponse('Leave approved', data));
};
