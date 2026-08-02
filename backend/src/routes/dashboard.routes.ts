import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import * as ctrl from '../controllers/dashboard.controller.js';

const router = Router();
const hrOnly = authorize('HR_ADMIN');

router.get('/overview', authenticate, hrOnly, ctrl.overview);
router.get('/employees', authenticate, hrOnly, ctrl.employees);
router.get('/attendance', authenticate, hrOnly, ctrl.attendance);
router.get('/payroll', authenticate, hrOnly, ctrl.payroll);
router.get('/recruitment', authenticate, hrOnly, ctrl.recruitment);
router.get('/training', authenticate, hrOnly, ctrl.training);
router.get('/assets', authenticate, hrOnly, ctrl.assets);

export default router;

