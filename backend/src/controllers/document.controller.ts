import type { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { documentService } from '../services/document.service.js';
import { buildApiResponse } from '../utils/api-response.js';
import { env } from '../config/env.js';

const id = (req: Request) => Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
const actor = (req: Request) => (req as any).user as { id: string; role: string };
const errorResponse = (res: Response, error: unknown, fallback: string) => {
  const message = error instanceof Error ? error.message : fallback;
  const status = message.includes('not found') ? 404 : message.includes('Forbidden') ? 403 : 400;
  return res.status(status).json(buildApiResponse(message, null, [message]));
};

const contentTypeForFile = (filePath: string) => {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.pdf') return 'application/pdf';
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.txt') return 'text/plain';
  if (ext === '.csv') return 'text/csv';
  if (ext === '.doc' || ext === '.docx') return 'application/msword';
  return 'application/octet-stream';
};

export const uploadDocument = async (req: Request, res: Response) => {
  try {
    const file = (req as any).file;
    if (!file) return res.status(400).json(buildApiResponse('File is required', null, ['File is required']));
    const { employeeId, documentName, documentType } = req.body as any;
    const currentUser = actor(req);
    const canCreateForOthers = ['HR_ADMIN', 'SUPER_ADMIN'].includes(currentUser?.role);
    if (employeeId && employeeId !== currentUser.id && !canCreateForOthers) return res.status(403).json(buildApiResponse('Forbidden: cannot upload for other employee', null, ['Forbidden']));
    const targetEmployee = employeeId || currentUser.id;
    const fileUrl = file.filename;
    const created = await documentService.uploadDocument(targetEmployee, documentName, documentType, fileUrl, currentUser.id);
    return res.status(201).json(buildApiResponse('Document uploaded successfully', created));
  } catch (e) { return errorResponse(res, e, 'Failed to upload document'); }
};

export const listDocuments = async (req: Request, res: Response) => {
  try {
    return res.json(buildApiResponse('Documents retrieved successfully', await documentService.list(req.query as any, actor(req))));
  } catch (e) { return errorResponse(res, e, 'Failed to list documents'); }
};

export const getDocument = async (req: Request, res: Response) => {
  try {
    return res.json(buildApiResponse('Document retrieved successfully', await documentService.get(id(req), actor(req))));
  } catch (e) { return errorResponse(res, e, 'Failed to get document'); }
};

export const downloadDocument = async (req: Request, res: Response) => {
  try {
    const document = await documentService.get(id(req), actor(req));
    const filePath = path.resolve(env.uploadDir, document.storageUrl);
    if (!fs.existsSync(filePath)) return res.status(404).json(buildApiResponse('File not found', null, ['File not found']));
    res.setHeader('Content-Type', contentTypeForFile(filePath));
    res.setHeader('Content-Disposition', `attachment; filename="${path.basename(filePath)}"`);
    return res.sendFile(filePath);
  } catch (e) { return errorResponse(res, e, 'Failed to download document'); }
};

export const previewDocument = async (req: Request, res: Response) => {
  try {
    const document = await documentService.get(id(req), actor(req));
    const filePath = path.resolve(env.uploadDir, document.storageUrl);
    if (!fs.existsSync(filePath)) return res.status(404).json(buildApiResponse('File not found', null, ['File not found']));
    res.setHeader('Content-Type', contentTypeForFile(filePath));
    res.setHeader('Content-Disposition', `inline; filename="${path.basename(filePath)}"`);
    return res.sendFile(filePath);
  } catch (e) { return errorResponse(res, e, 'Failed to preview document'); }
};

export const deleteDocument = async (req: Request, res: Response) => {
  try {
    return res.json(buildApiResponse('Document deleted successfully', await documentService.delete(id(req), actor(req))));
  } catch (e) { return errorResponse(res, e, 'Failed to delete document'); }
};

export const employeeDocuments = async (req: Request, res: Response) => {
  try {
    const employeeId = Array.isArray(req.params.employeeId) ? req.params.employeeId[0] : req.params.employeeId;
    return res.json(buildApiResponse('Employee documents retrieved successfully', await documentService.listByEmployee(employeeId, Number(req.query.page) || 1, Number(req.query.limit) || 20, actor(req))));
  } catch (e) { return errorResponse(res, e, 'Failed to get employee documents'); }
};
