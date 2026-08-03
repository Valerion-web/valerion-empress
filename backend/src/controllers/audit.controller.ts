import type { Request, Response } from 'express';
import { auditService } from '../services/audit.service.js';
import { buildApiResponse } from '../utils/api-response.js';

const readParam = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export const logAction = async (req: Request, res: Response) => {
  try {
    const data = await auditService.recordAction({
      userId: (req as any).user?.id ?? null,
      action: req.body?.action ?? 'ACTION',
      module: req.body?.module ?? 'SYSTEM',
      entity: req.body?.entity ?? 'UNKNOWN',
      entityId: req.body?.entityId ?? null,
      metadata: req.body?.metadata ?? {},
    });

    return res.status(201).json(buildApiResponse('Audit event recorded successfully', data));
  } catch (error) {
    return res.status(500).json(buildApiResponse('Failed to record audit event', null, [String(error)]));
  }
};

export const listAuditLogs = async (req: Request, res: Response) => {
  try {
    const data = await auditService.listLogs({
      q: readParam(req.query.q as string | string[] | undefined),
      userId: readParam(req.query.userId as string | string[] | undefined),
      action: readParam(req.query.action as string | string[] | undefined),
      module: readParam(req.query.module as string | string[] | undefined),
      startDate: readParam(req.query.startDate as string | string[] | undefined),
      endDate: readParam(req.query.endDate as string | string[] | undefined),
      page: Number(req.query.page ?? 1),
      limit: Number(req.query.limit ?? 20),
      sortBy: readParam(req.query.sortBy as string | string[] | undefined) ?? 'createdAt',
      sortOrder: (readParam(req.query.sortOrder as string | string[] | undefined) as 'asc' | 'desc') ?? 'desc',
    });

    return res.status(200).json(buildApiResponse('Audit logs retrieved successfully', data));
  } catch (error) {
    return res.status(500).json(buildApiResponse('Failed to retrieve audit logs', null, [String(error)]));
  }
};

export const exportAuditCsv = async (req: Request, res: Response) => {
  try {
    const csv = await auditService.exportCsv({
      q: readParam(req.query.q as string | string[] | undefined),
      userId: readParam(req.query.userId as string | string[] | undefined),
      action: readParam(req.query.action as string | string[] | undefined),
      module: readParam(req.query.module as string | string[] | undefined),
      startDate: readParam(req.query.startDate as string | string[] | undefined),
      endDate: readParam(req.query.endDate as string | string[] | undefined),
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="audit-logs.csv"');
    return res.send(csv);
  } catch (error) {
    return res.status(500).json(buildApiResponse('Failed to export audit logs CSV', null, [String(error)]));
  }
};

export const exportAuditPdf = async (req: Request, res: Response) => {
  try {
    const pdf = await auditService.exportPdf({
      q: readParam(req.query.q as string | string[] | undefined),
      userId: readParam(req.query.userId as string | string[] | undefined),
      action: readParam(req.query.action as string | string[] | undefined),
      module: readParam(req.query.module as string | string[] | undefined),
      startDate: readParam(req.query.startDate as string | string[] | undefined),
      endDate: readParam(req.query.endDate as string | string[] | undefined),
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="audit-logs.pdf"');
    return res.send(pdf);
  } catch (error) {
    return res.status(500).json(buildApiResponse('Failed to export audit logs PDF', null, [String(error)]));
  }
};
