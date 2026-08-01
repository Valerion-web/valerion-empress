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

const router = Router();
router.post('/', authenticate, authorize('HR_ADMIN', 'SUPER_ADMIN'), validate(createSchema), createRecruitment);
router.get('/', authenticate, authorize('HR_ADMIN', 'MANAGER', 'SUPER_ADMIN'), getRecruitments);
router.get('/:id', authenticate, authorize('HR_ADMIN', 'MANAGER', 'SUPER_ADMIN'), validate(recruitmentIdSchema), getRecruitmentById);
router.put('/:id', authenticate, authorize('HR_ADMIN', 'SUPER_ADMIN'), validate(recruitmentIdSchema), validate(updateSchema), updateRecruitment);
router.delete('/:id', authenticate, authorize('HR_ADMIN', 'SUPER_ADMIN'), validate(recruitmentIdSchema), deleteRecruitment);

export default router;
