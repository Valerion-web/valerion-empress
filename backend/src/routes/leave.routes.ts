import { Router } from 'express';
import { approveLeave, listLeaves, requestLeave } from '../controllers/leave.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

router.post('/request', authenticate, authorize('EMPLOYEE', 'MANAGER', 'HR_ADMIN', 'SUPER_ADMIN'), requestLeave);
router.get('/', authenticate, authorize('EMPLOYEE', 'MANAGER', 'HR_ADMIN', 'SUPER_ADMIN'), listLeaves);
router.patch('/:id/approve', authenticate, authorize('MANAGER', 'HR_ADMIN', 'SUPER_ADMIN'), approveLeave);

export default router;
