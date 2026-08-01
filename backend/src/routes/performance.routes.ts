import { Router } from 'express';
import {
  createPerformance,
  getAllPerformances,
  getPerformanceById,
  updatePerformance,
  deletePerformance,
  getPerformancesByEmployee,
  getPerformancesByReviewer,
} from '../controllers/performance.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import {
  createPerformanceSchema,
  updatePerformanceSchema,
  performanceIdSchema,
  employeeIdSchema,
  reviewerIdSchema,
  performanceQuerySchema,
} from '../validators/performance.validator.js';

const router = Router();

router.post(
  '/',
  authenticate,
  authorize('HR_ADMIN', 'MANAGER', 'SUPER_ADMIN'),
  validate(createPerformanceSchema),
  createPerformance
);

router.get(
  '/',
  authenticate,
  authorize('HR_ADMIN', 'MANAGER', 'EMPLOYEE', 'SUPER_ADMIN'),
  validate(performanceQuerySchema),
  getAllPerformances
);

router.get(
  '/employee/:employeeId',
  authenticate,
  authorize('HR_ADMIN', 'MANAGER', 'EMPLOYEE', 'SUPER_ADMIN'),
  validate(employeeIdSchema),
  getPerformancesByEmployee
);

router.put(
  '/:id',
  authenticate,
  authorize('HR_ADMIN', 'MANAGER', 'SUPER_ADMIN'),
  validate(performanceIdSchema),
  validate(updatePerformanceSchema),
  updatePerformance
);

router.delete(
  '/:id',
  authenticate,
  authorize('HR_ADMIN', 'SUPER_ADMIN'),
  validate(performanceIdSchema),
  deletePerformance
);

router.get(
  '/reviewer/:reviewerId',
  authenticate,
  authorize('HR_ADMIN', 'MANAGER', 'SUPER_ADMIN'),
  validate(reviewerIdSchema),
  getPerformancesByReviewer
);

router.get(
  '/:id',
  authenticate,
  authorize('HR_ADMIN', 'MANAGER', 'EMPLOYEE', 'SUPER_ADMIN'),
  validate(performanceIdSchema),
  getPerformanceById
);

export default router;
