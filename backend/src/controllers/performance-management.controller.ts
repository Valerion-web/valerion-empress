import type { Request, Response } from 'express';
import type { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { buildApiResponse } from '../utils/api-response.js';

const cycleData = (body: Record<string, unknown>): Prisma.PerformanceCycleCreateInput => {
  const data: Prisma.PerformanceCycleCreateInput = {
    title: body.title as string,
    description: body.description as string | undefined,
    startDate: body.startDate ? new Date(body.startDate as string) : new Date(),
    endDate: body.endDate ? new Date(body.endDate as string) : new Date(),
    status: (body.status as 'DRAFT' | 'ACTIVE' | 'CLOSED' | undefined) ?? 'DRAFT',
  };

  if (body.createdById) {
    data.createdBy = { connect: { id: body.createdById as string } };
  }

  return data;
};

const goalData = (body: Record<string, unknown>): Prisma.PerformanceGoalCreateInput => ({
  cycle: { connect: { id: body.cycleId as string } },
  employee: { connect: { id: body.employeeId as string } },
  title: body.title as string,
  description: body.description as string | undefined,
  targetValue: body.targetValue as number | undefined,
  currentValue: body.currentValue as number | undefined,
  unit: body.unit as string | undefined,
  progress: body.progress as number | undefined,
  dueDate: body.dueDate ? new Date(body.dueDate as string) : undefined,
  status: (body.status as 'ACTIVE' | 'ACHIEVED' | 'MISSED' | undefined) ?? 'ACTIVE',
});

const kpiData = (body: Record<string, unknown>): Prisma.PerformanceKpiCreateInput => ({
  cycle: { connect: { id: body.cycleId as string } },
  employee: { connect: { id: body.employeeId as string } },
  title: body.title as string,
  description: body.description as string | undefined,
  targetValue: body.targetValue as number | undefined,
  currentValue: body.currentValue as number | undefined,
  unit: body.unit as string | undefined,
  weight: body.weight as number | undefined,
  achieved: body.achieved as boolean | undefined,
  status: (body.status as 'ACTIVE' | 'ACHIEVED' | 'MISSED' | undefined) ?? 'ACTIVE',
  dueDate: body.dueDate ? new Date(body.dueDate as string) : undefined,
});

const assessmentData = (body: Record<string, unknown>): Prisma.SelfAssessmentCreateInput => ({
  cycle: { connect: { id: body.cycleId as string } },
  employee: { connect: { id: body.employeeId as string } },
  summary: body.summary as string | undefined,
  strengths: body.strengths as string | undefined,
  improvements: body.improvements as string | undefined,
  rating: body.rating as number | undefined,
  status: (body.status as 'DRAFT' | 'SUBMITTED' | undefined) ?? 'DRAFT',
  submittedAt: body.submittedAt ? new Date(body.submittedAt as string) : undefined,
});

const feedbackData = (body: Record<string, unknown>): Prisma.ManagerFeedbackCreateInput => ({
  cycle: { connect: { id: body.cycleId as string } },
  employee: { connect: { id: body.employeeId as string } },
  reviewer: { connect: { id: body.reviewerId as string } },
  feedback: body.feedback as string,
  rating: body.rating as number | undefined,
  status: (body.status as string | undefined) ?? 'SUBMITTED',
});

export const createCycle = async (req: Request, res: Response) => {
  try {
    const cycle = await prisma.performanceCycle.create({ data: cycleData(req.body) });
    return res.status(201).json(buildApiResponse('Performance cycle created successfully', cycle));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create performance cycle';
    return res.status(400).json(buildApiResponse(message, null, [message]));
  }
};

export const listCycles = async (req: Request, res: Response) => {
  try {
    const cycles = await prisma.performanceCycle.findMany({ orderBy: { createdAt: 'desc' } });
    return res.status(200).json(buildApiResponse('Performance cycles retrieved successfully', cycles));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch performance cycles';
    return res.status(400).json(buildApiResponse(message, null, [message]));
  }
};

export const createGoal = async (req: Request, res: Response) => {
  try {
    const goal = await prisma.performanceGoal.create({ data: goalData(req.body) });
    return res.status(201).json(buildApiResponse('Performance goal created successfully', goal));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create performance goal';
    return res.status(400).json(buildApiResponse(message, null, [message]));
  }
};

export const listGoals = async (req: Request, res: Response) => {
  try {
    const goals = await prisma.performanceGoal.findMany({ orderBy: { createdAt: 'desc' }, include: { employee: { select: { id: true, firstName: true, lastName: true } } } });
    return res.status(200).json(buildApiResponse('Performance goals retrieved successfully', goals));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch performance goals';
    return res.status(400).json(buildApiResponse(message, null, [message]));
  }
};

export const createKpi = async (req: Request, res: Response) => {
  try {
    const kpi = await prisma.performanceKpi.create({ data: kpiData(req.body) });
    return res.status(201).json(buildApiResponse('Performance KPI created successfully', kpi));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create performance KPI';
    return res.status(400).json(buildApiResponse(message, null, [message]));
  }
};

export const listKpis = async (req: Request, res: Response) => {
  try {
    const kpis = await prisma.performanceKpi.findMany({ orderBy: { createdAt: 'desc' }, include: { employee: { select: { id: true, firstName: true, lastName: true } } } });
    return res.status(200).json(buildApiResponse('Performance KPIs retrieved successfully', kpis));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch performance KPIs';
    return res.status(400).json(buildApiResponse(message, null, [message]));
  }
};

export const createAssessment = async (req: Request, res: Response) => {
  try {
    const assessment = await prisma.selfAssessment.create({ data: assessmentData(req.body) });
    return res.status(201).json(buildApiResponse('Self assessment created successfully', assessment));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create self assessment';
    return res.status(400).json(buildApiResponse(message, null, [message]));
  }
};

export const listAssessments = async (req: Request, res: Response) => {
  try {
    const assessments = await prisma.selfAssessment.findMany({ orderBy: { createdAt: 'desc' }, include: { employee: { select: { id: true, firstName: true, lastName: true } } } });
    return res.status(200).json(buildApiResponse('Self assessments retrieved successfully', assessments));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch self assessments';
    return res.status(400).json(buildApiResponse(message, null, [message]));
  }
};

export const createFeedback = async (req: Request, res: Response) => {
  try {
    const feedback = await prisma.managerFeedback.create({ data: feedbackData(req.body) });
    return res.status(201).json(buildApiResponse('Manager feedback created successfully', feedback));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create manager feedback';
    return res.status(400).json(buildApiResponse(message, null, [message]));
  }
};

export const listFeedback = async (req: Request, res: Response) => {
  try {
    const feedback = await prisma.managerFeedback.findMany({ orderBy: { createdAt: 'desc' }, include: { employee: { select: { id: true, firstName: true, lastName: true } }, reviewer: { select: { id: true, firstName: true, lastName: true } } } });
    return res.status(200).json(buildApiResponse('Manager feedback retrieved successfully', feedback));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch manager feedback';
    return res.status(400).json(buildApiResponse(message, null, [message]));
  }
};

export const getDashboardStats = async (_req: Request, res: Response) => {
  try {
    const [activeCycles, activeGoals, submittedAssessments, pendingFeedback] = await Promise.all([
      prisma.performanceCycle.count({ where: { status: 'ACTIVE' } }),
      prisma.performanceGoal.count({ where: { status: 'ACTIVE' } }),
      prisma.selfAssessment.count({ where: { status: 'SUBMITTED' } }),
      prisma.managerFeedback.count({ where: { status: 'SUBMITTED' } }),
    ]);

    return res.status(200).json(buildApiResponse('Performance dashboard retrieved successfully', { activeCycles, activeGoals, submittedAssessments, pendingFeedback }));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch performance dashboard';
    return res.status(400).json(buildApiResponse(message, null, [message]));
  }
};
