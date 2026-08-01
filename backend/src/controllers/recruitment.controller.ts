import type { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { buildApiResponse } from '../utils/api-response.js';

function recruitmentData(body: Record<string, unknown>) {
  return {
    title: body.title as string,
    departmentId: body.departmentId as string | undefined,
    managerId: body.managerId as string | undefined,
    status: (body.status as 'OPEN' | 'CLOSED' | 'FILLED' | undefined) ?? 'OPEN',
    openPositions: body.openPositions as number,
    budget: body.budget as number | undefined,
  };
}

export const createRecruitment = async (req: Request, res: Response) => {
  try {
    const recruitment = await prisma.recruitment.create({ data: recruitmentData(req.body) });
    return res.status(201).json(buildApiResponse('Recruitment created successfully', recruitment));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create recruitment';
    return res.status(400).json(buildApiResponse(message, null, [message]));
  }
};

export const getRecruitments = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
    const where = req.query.status ? { status: req.query.status as 'OPEN' | 'CLOSED' | 'FILLED' } : undefined;
    const [recruitments, total] = await prisma.$transaction([
      prisma.recruitment.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.recruitment.count({ where }),
    ]);
    return res.status(200).json(buildApiResponse('Recruitments retrieved successfully', { recruitments, total, page, limit }));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch recruitments';
    return res.status(400).json(buildApiResponse(message, null, [message]));
  }
};

export const getRecruitmentById = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const recruitment = await prisma.recruitment.findUnique({ where: { id } });
    if (!recruitment) return res.status(404).json(buildApiResponse('Recruitment not found', null, ['Recruitment not found']));
    return res.status(200).json(buildApiResponse('Recruitment retrieved successfully', recruitment));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch recruitment';
    return res.status(400).json(buildApiResponse(message, null, [message]));
  }
};

export const updateRecruitment = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const recruitment = await prisma.recruitment.update({ where: { id }, data: recruitmentData(req.body) });
    return res.status(200).json(buildApiResponse('Recruitment updated successfully', recruitment));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update recruitment';
    return res.status(400).json(buildApiResponse(message, null, [message]));
  }
};

export const deleteRecruitment = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const recruitment = await prisma.recruitment.delete({ where: { id } });
    return res.status(200).json(buildApiResponse('Recruitment deleted successfully', recruitment));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete recruitment';
    return res.status(400).json(buildApiResponse(message, null, [message]));
  }
};
