import type { Request, Response } from 'express';
import { trainingService } from '../services/training.service.js';
import { buildApiResponse } from '../utils/api-response.js';

const id = (req: Request) => (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
const errorResponse = (res: Response, error: unknown, fallback: string) => {
  const message = error instanceof Error ? error.message : fallback;
  const status = message.includes('not found') ? 404 : message.includes('Forbidden') ? 403 : 400;
  return res.status(status).json(buildApiResponse(message, null, [message]));
};

export const createTraining = async (req: Request, res: Response) => {
  try {
    return res.status(201).json(buildApiResponse('Training created', await trainingService.create(req.body)));
  } catch (e) {
    return errorResponse(res, e, 'Failed to create training');
  }
};

export const listTrainings = async (req: Request, res: Response) => {
  try {
    return res.json(buildApiResponse('Trainings retrieved', await trainingService.list(req.query as any)));
  } catch (e) {
    return errorResponse(res, e, 'Failed to list trainings');
  }
};

export const getTraining = async (req: Request, res: Response) => {
  try {
    return res.json(buildApiResponse('Training retrieved', await trainingService.get(id(req))));
  } catch (e) {
    return errorResponse(res, e, 'Failed to get training');
  }
};

export const updateTraining = async (req: Request, res: Response) => {
  try {
    return res.json(buildApiResponse('Training updated', await trainingService.update(id(req), req.body)));
  } catch (e) {
    return errorResponse(res, e, 'Failed to update training');
  }
};

export const deleteTraining = async (req: Request, res: Response) => {
  try {
    return res.json(buildApiResponse('Training deleted', await trainingService.delete(id(req))));
  } catch (e) {
    return errorResponse(res, e, 'Failed to delete training');
  }
};

export const assignTraining = async (req: Request, res: Response) => {
  try {
    const body = req.body as Record<string, any>;
    const userId = body.userId ?? (req as any).user?.id;
    return res.status(201).json(buildApiResponse('Assigned', await trainingService.assign(id(req), userId, body.assignedBy ?? (req as any).user?.id)));
  } catch (e) {
    return errorResponse(res, e, 'Failed to assign training');
  }
};

export const myTrainings = async (req: Request, res: Response) => {
  try {
    return res.json(buildApiResponse('My trainings retrieved', await trainingService.myTrainings((req as any).user.id, Number(req.query.page) || 1, Number(req.query.limit) || 20)));
  } catch (e) {
    return errorResponse(res, e, 'Failed to get my trainings');
  }
};

export const completeTraining = async (req: Request, res: Response) => {
  try {
    return res.json(buildApiResponse('Marked completed', await trainingService.complete(id(req), (req as any).user.id, req.body)));
  } catch (e) {
    return errorResponse(res, e, 'Failed to mark complete');
  }
};

export const trainingAssignments = async (req: Request, res: Response) => {
  try {
    return res.json(buildApiResponse('Assignments retrieved', await trainingService.assignments(id(req))));
  } catch (e) {
    return errorResponse(res, e, 'Failed to get assignments');
  }
};
