import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { z } from 'zod';
import {
  createCycle,
  listCycles,
  createGoal,
  listGoals,
  createKpi,
  listKpis,
  createAssessment,
  listAssessments,
  createFeedback,
  listFeedback,
  getDashboardStats,
} from '../controllers/performance-management.controller.js';

const cycleSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    status: z.enum(['DRAFT', 'ACTIVE', 'CLOSED']).optional(),
    createdById: z.string().uuid().optional(),
  }),
});

const goalSchema = z.object({
  body: z.object({
    cycleId: z.string().uuid(),
    employeeId: z.string().uuid(),
    title: z.string().min(1),
    description: z.string().optional(),
    targetValue: z.number().optional(),
    currentValue: z.number().optional(),
    unit: z.string().optional(),
    progress: z.number().int().min(0).max(100).optional(),
    dueDate: z.string().optional(),
    status: z.enum(['ACTIVE', 'ACHIEVED', 'MISSED']).optional(),
  }),
});

const kpiSchema = z.object({
  body: z.object({
    cycleId: z.string().uuid(),
    employeeId: z.string().uuid(),
    title: z.string().min(1),
    description: z.string().optional(),
    targetValue: z.number().optional(),
    currentValue: z.number().optional(),
    unit: z.string().optional(),
    weight: z.number().int().min(1).max(100).optional(),
    achieved: z.boolean().optional(),
    dueDate: z.string().optional(),
    status: z.enum(['ACTIVE', 'ACHIEVED', 'MISSED']).optional(),
  }),
});

const assessmentSchema = z.object({
  body: z.object({
    cycleId: z.string().uuid(),
    employeeId: z.string().uuid(),
    summary: z.string().optional(),
    strengths: z.string().optional(),
    improvements: z.string().optional(),
    rating: z.number().int().min(1).max(5).optional(),
    status: z.enum(['DRAFT', 'SUBMITTED']).optional(),
    submittedAt: z.string().optional(),
  }),
});

const feedbackSchema = z.object({
  body: z.object({
    cycleId: z.string().uuid(),
    employeeId: z.string().uuid(),
    reviewerId: z.string().uuid(),
    feedback: z.string().min(1),
    rating: z.number().int().min(1).max(5).optional(),
    status: z.string().optional(),
  }),
});

const router = Router();
router.get('/dashboard', authenticate, authorize('HR_ADMIN', 'MANAGER', 'EMPLOYEE', 'SUPER_ADMIN'), getDashboardStats);
router.post('/cycles', authenticate, authorize('HR_ADMIN', 'MANAGER', 'SUPER_ADMIN'), validate(cycleSchema), createCycle);
router.get('/cycles', authenticate, authorize('HR_ADMIN', 'MANAGER', 'EMPLOYEE', 'SUPER_ADMIN'), listCycles);
router.post('/goals', authenticate, authorize('HR_ADMIN', 'MANAGER', 'SUPER_ADMIN'), validate(goalSchema), createGoal);
router.get('/goals', authenticate, authorize('HR_ADMIN', 'MANAGER', 'EMPLOYEE', 'SUPER_ADMIN'), listGoals);
router.post('/kpis', authenticate, authorize('HR_ADMIN', 'MANAGER', 'SUPER_ADMIN'), validate(kpiSchema), createKpi);
router.get('/kpis', authenticate, authorize('HR_ADMIN', 'MANAGER', 'EMPLOYEE', 'SUPER_ADMIN'), listKpis);
router.post('/assessments', authenticate, authorize('HR_ADMIN', 'MANAGER', 'EMPLOYEE', 'SUPER_ADMIN'), validate(assessmentSchema), createAssessment);
router.get('/assessments', authenticate, authorize('HR_ADMIN', 'MANAGER', 'EMPLOYEE', 'SUPER_ADMIN'), listAssessments);
router.post('/feedback', authenticate, authorize('HR_ADMIN', 'MANAGER', 'SUPER_ADMIN'), validate(feedbackSchema), createFeedback);
router.get('/feedback', authenticate, authorize('HR_ADMIN', 'MANAGER', 'EMPLOYEE', 'SUPER_ADMIN'), listFeedback);

export default router;
