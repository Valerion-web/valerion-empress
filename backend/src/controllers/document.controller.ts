import type { Request, Response } from 'express';
import { documentService } from '../services/document.service.js';
import { buildApiResponse } from '../utils/api-response.js';
import { env } from '../config/env.js';

const id = (req: Request) => Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
const errorResponse = (res: Response, error: unknown, fallback: string) => {
  const message = error instanceof Error ? error.message : fallback;
  const status = message.includes('not found') ? 404 : message.includes('Forbidden') ? 403 : 400;
  return res.status(status).json(buildApiResponse(message, null, [message]));
};

export const uploadDocument = async (req: Request, res: Response) => {
  try {
    const file = (req as any).file;
    if (!file) return res.status(400).json(buildApiResponse('File is required', null, ['File is required']));
    const { employeeId, documentName, documentType } = req.body as any;
    const actor = (req as any).user;
    // only allow creating for others if actor has HR_ADMIN or SUPER_ADMIN
    const canCreateForOthers = ['HR_ADMIN', 'SUPER_ADMIN'].includes(actor?.role);
    if (employeeId && employeeId !== actor.id && !canCreateForOthers) return res.status(403).json(buildApiResponse('Forbidden: cannot upload for other employee', null, ['Forbidden']));
    const targetEmployee = employeeId || actor.id;
    const fileUrl = file.filename;
    const created = await documentService.uploadDocument(targetEmployee, documentName, documentType, fileUrl, actor.id);
    return res.status(201).json(buildApiResponse('Document uploaded successfully', created));
  } catch (e) { return errorResponse(res, e, 'Failed to upload document'); }
};

export const listDocuments = async (req: Request, res: Response) => { try { return res.json(buildApiResponse('Documents retrieved successfully', await documentService.list(req.query as any))); } catch (e) { return errorResponse(res, e, 'Failed to list documents'); } };
export const getDocument = async (req: Request, res: Response) => { try { return res.json(buildApiResponse('Document retrieved successfully', await documentService.get(id(req)))); } catch (e) { return errorResponse(res, e, 'Failed to get document'); } };
export const deleteDocument = async (req: Request, res: Response) => { try { const actorId = (req as any).user.id; const doc = await documentService.get(id(req)); if (doc.userId !== actorId && !['HR_ADMIN','SUPER_ADMIN'].includes((req as any).user.role)) return res.status(403).json(buildApiResponse('Forbidden', null, ['Forbidden'])); return res.json(buildApiResponse('Document deleted successfully', await documentService.delete(id(req)))); } catch (e) { return errorResponse(res, e, 'Failed to delete document'); } };
export const employeeDocuments = async (req: Request, res: Response) => { try { return res.json(buildApiResponse('Employee documents retrieved successfully', await documentService.listByEmployee(Array.isArray(req.params.employeeId) ? req.params.employeeId[0] : req.params.employeeId, Number(req.query.page) || 1, Number(req.query.limit) || 20))); } catch (e) { return errorResponse(res, e, 'Failed to get employee documents'); } };
