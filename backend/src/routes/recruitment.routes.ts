import { Router } from 'express';
import { z } from 'zod';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import {
  createRecruitment,
  getRecruitments,
  getRecruitmentById,
  updateRecruitment,
  deleteRecruitment,
  createCandidate,
  listCandidates,
  updateCandidateStatus,
  createInterview,
  listInterviews,
  createOffer,
  listOffers,
  updateOffer,
  getDashboardStats,
} from '../controllers/recruitment.controller.js';

const recruitmentIdSchema = z.object({ params: z.object({ id: z.string().uuid() }) });
const createSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200),
    departmentId: z.string().uuid().optional(),
    managerId: z.string().uuid().optional(),
    status: z.enum(['OPEN', 'CLOSED', 'FILLED']).optional(),
    openPositions: z.number().int().positive(),
    budget: z.number().nonnegative().optional(),
  }),
});
const updateSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    departmentId: z.string().uuid().nullable().optional(),
    managerId: z.string().uuid().nullable().optional(),
    status: z.enum(['OPEN', 'CLOSED', 'FILLED']).optional(),
    openPositions: z.number().int().positive().optional(),
    budget: z.number().nonnegative().nullable().optional(),
  }).refine((body) => Object.keys(body).length > 0, 'At least one update field is required'),
});
const candidateCreateSchema = z.object({
  body: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
    source: z.string().optional(),
    status: z.enum(['APPLIED', 'SCREENING', 'INTERVIEWING', 'OFFERED', 'HIRED', 'REJECTED']).optional(),
  }),
});
const candidateStatusSchema = z.object({
  body: z.object({ status: z.enum(['APPLIED', 'SCREENING', 'INTERVIEWING', 'OFFERED', 'HIRED', 'REJECTED']) }),
});
const interviewCreateSchema = z.object({
  body: z.object({
    scheduledAt: z.string().or(z.date()),
    mode: z.string().optional(),
    round: z.number().int().positive().optional(),
    feedback: z.string().optional(),
  }),
});
const offerSchema = z.object({
  body: z.object({
    candidateId: z.string().uuid(),
    offeredSalary: z.number().nonnegative().optional(),
    status: z.enum(['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED']).optional(),
  }),
});
const offerUpdateSchema = z.object({
  body: z.object({
    status: z.enum(['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED']).optional(),
    offeredSalary: z.number().nonnegative().optional(),
  }).refine((body) => Object.keys(body).length > 0, 'At least one update field is required'),
});

const router = Router();
router.post('/', authenticate, authorize('HR_ADMIN', 'SUPER_ADMIN'), validate(createSchema), createRecruitment);
router.get('/', authenticate, authorize('HR_ADMIN', 'MANAGER', 'SUPER_ADMIN'), getRecruitments);
router.get('/dashboard', authenticate, authorize('HR_ADMIN', 'MANAGER', 'SUPER_ADMIN'), getDashboardStats);
router.get('/candidates', authenticate, authorize('HR_ADMIN', 'MANAGER', 'SUPER_ADMIN'), listCandidates);
router.get('/offers', authenticate, authorize('HR_ADMIN', 'MANAGER', 'SUPER_ADMIN'), listOffers);
router.post('/:jobId/candidates', authenticate, authorize('HR_ADMIN', 'MANAGER', 'SUPER_ADMIN'), validate(candidateCreateSchema), createCandidate);
router.get('/:id', authenticate, authorize('HR_ADMIN', 'MANAGER', 'SUPER_ADMIN'), validate(recruitmentIdSchema), getRecruitmentById);
router.put('/:id', authenticate, authorize('HR_ADMIN', 'SUPER_ADMIN'), validate(recruitmentIdSchema), validate(updateSchema), updateRecruitment);
router.delete('/:id', authenticate, authorize('HR_ADMIN', 'SUPER_ADMIN'), validate(recruitmentIdSchema), deleteRecruitment);
router.patch('/candidates/:id/status', authenticate, authorize('HR_ADMIN', 'MANAGER', 'SUPER_ADMIN'), validate(candidateStatusSchema), updateCandidateStatus);
router.post('/candidates/:id/interviews', authenticate, authorize('HR_ADMIN', 'MANAGER', 'SUPER_ADMIN'), validate(interviewCreateSchema), createInterview);
router.get('/candidates/:id/interviews', authenticate, authorize('HR_ADMIN', 'MANAGER', 'SUPER_ADMIN'), listInterviews);
router.post('/offers', authenticate, authorize('HR_ADMIN', 'MANAGER', 'SUPER_ADMIN'), validate(offerSchema), createOffer);
router.put('/offers/:id', authenticate, authorize('HR_ADMIN', 'MANAGER', 'SUPER_ADMIN'), validate(recruitmentIdSchema), validate(offerUpdateSchema), updateOffer);

export default router;
