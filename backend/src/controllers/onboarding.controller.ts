import type { Request, Response } from 'express';
import { buildApiResponse } from '../utils/api-response.js';
import { onboardingService } from '../services/onboarding.service.js';

const getId = (req: Request, key: 'id' | 'taskId' = 'id') => {
  const value = req.params[key];
  return Array.isArray(value) ? value[0] : value;
};

const handleError = (res: Response, error: unknown, fallback: string) => {
  const message = error instanceof Error ? error.message : fallback;
  const status = message.toLowerCase().includes('not found') ? 404 : message.toLowerCase().includes('forbidden') ? 403 : 400;
  return res.status(status).json(buildApiResponse(message, null, [message]));
};

export const createOnboardingRecord = async (req: Request, res: Response) => {
  try {
    const record = await onboardingService.createRecord({
      employeeId: req.body.employeeId,
      managerId: req.body.managerId,
      role: req.body.role,
      startDate: req.body.startDate,
      employeeName: req.body.employeeName,
    });
    return res.status(201).json(buildApiResponse('Onboarding record created successfully', record));
  } catch (error) {
    return handleError(res, error, 'Failed to create onboarding record');
  }
};

export const listOnboardingRecords = async (_req: Request, res: Response) => {
  try {
    const records = await onboardingService.listRecords();
    return res.json(buildApiResponse('Onboarding records retrieved successfully', records));
  } catch (error) {
    return handleError(res, error, 'Failed to list onboarding records');
  }
};

export const getOnboardingDashboard = async (_req: Request, res: Response) => {
  try {
    const dashboard = await onboardingService.getDashboard();
    return res.json(buildApiResponse('Onboarding dashboard retrieved successfully', dashboard));
  } catch (error) {
    return handleError(res, error, 'Failed to load onboarding dashboard');
  }
};

export const getOnboardingRecord = async (req: Request, res: Response) => {
  try {
    const record = await onboardingService.getRecord(getId(req));
    return res.json(buildApiResponse('Onboarding record retrieved successfully', record));
  } catch (error) {
    return handleError(res, error, 'Failed to get onboarding record');
  }
};

export const assignOnboardingTasks = async (req: Request, res: Response) => {
  try {
    const updated = await onboardingService.assignTasks(getId(req), req.body.tasks ?? []);
    return res.json(buildApiResponse('Onboarding tasks assigned successfully', updated));
  } catch (error) {
    return handleError(res, error, 'Failed to assign onboarding tasks');
  }
};

export const updateOnboardingTask = async (req: Request, res: Response) => {
  try {
    const status = req.body.status;
    const updated = await onboardingService.updateTaskStatus(getId(req, 'id'), getId(req, 'taskId'), status);
    return res.json(buildApiResponse('Onboarding task updated successfully', updated));
  } catch (error) {
    return handleError(res, error, 'Failed to update onboarding task');
  }
};

export const uploadOnboardingDocument = async (req: Request, res: Response) => {
  try {
    const file = (req as any).file;
    if (!file) return res.status(400).json(buildApiResponse('File is required', null, ['File is required']));
    const record = await onboardingService.uploadDocument(getId(req), file.originalname || file.filename, req.body.category || 'GENERAL');
    return res.status(201).json(buildApiResponse('Onboarding document uploaded successfully', record));
  } catch (error) {
    return handleError(res, error, 'Failed to upload onboarding document');
  }
};

export const approveOnboardingRecord = async (req: Request, res: Response) => {
  try {
    const updated = await onboardingService.approveRecord(getId(req), req.body.status, req.body.comments);
    return res.json(buildApiResponse('Onboarding approval updated successfully', updated));
  } catch (error) {
    return handleError(res, error, 'Failed to update onboarding approval');
  }
};

export const getMyOnboardingChecklist = async (req: Request, res: Response) => {
  try {
    const employeeId = (req as any).user.id;
    const checklist = await onboardingService.getMyChecklist(employeeId);
    return res.json(buildApiResponse('Onboarding checklist retrieved successfully', checklist));
  } catch (error) {
    return handleError(res, error, 'Failed to fetch onboarding checklist');
  }
};

export const createResignationRequest = async (req: Request, res: Response) => {
  try {
    const record = await onboardingService.createResignationRequest({
      employeeId: req.body.employeeId ?? (req as any).user.id,
      employeeName: req.body.employeeName,
      reason: req.body.reason,
      resignationDate: req.body.resignationDate,
    });
    return res.status(201).json(buildApiResponse('Resignation request created successfully', record));
  } catch (error) {
    return handleError(res, error, 'Failed to create resignation request');
  }
};

export const listOffboardingRecords = async (_req: Request, res: Response) => {
  try {
    const records = await onboardingService.listOffboardingRecords();
    return res.json(buildApiResponse('Offboarding records retrieved successfully', records));
  } catch (error) {
    return handleError(res, error, 'Failed to list offboarding records');
  }
};

export const updateExitInterview = async (req: Request, res: Response) => {
  try {
    const updated = await onboardingService.updateExitInterview(getId(req), req.body.interview || req.body.exitInterview || '');
    return res.json(buildApiResponse('Exit interview updated successfully', updated));
  } catch (error) {
    return handleError(res, error, 'Failed to update exit interview');
  }
};

export const updateAssetReturn = async (req: Request, res: Response) => {
  try {
    const updated = await onboardingService.updateAssetReturn(getId(req), req.body.status || 'RETURNED');
    return res.json(buildApiResponse('Asset return status updated successfully', updated));
  } catch (error) {
    return handleError(res, error, 'Failed to update asset return status');
  }
};

export const updateClearance = async (req: Request, res: Response) => {
  try {
    const updated = await onboardingService.updateClearance(getId(req), req.body.clearanceItems || []);
    return res.json(buildApiResponse('Clearance workflow updated successfully', updated));
  } catch (error) {
    return handleError(res, error, 'Failed to update clearance workflow');
  }
};

export const updateFinalSettlement = async (req: Request, res: Response) => {
  try {
    const updated = await onboardingService.updateSettlement(getId(req), Number(req.body.settlementAmount ?? 0), req.body.finalComments ?? null);
    return res.json(buildApiResponse('Final settlement updated successfully', updated));
  } catch (error) {
    return handleError(res, error, 'Failed to update final settlement');
  }
};

export const updateOffboardingStatus = async (req: Request, res: Response) => {
  try {
    const updated = await onboardingService.updateStatus(getId(req), req.body.status || 'IN_PROGRESS');
    return res.json(buildApiResponse('Exit status updated successfully', updated));
  } catch (error) {
    return handleError(res, error, 'Failed to update exit status');
  }
};
