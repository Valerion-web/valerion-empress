import { Router } from 'express';
import {
  createLeave,
  getAllLeaves,
  getLeaveById,
  updateLeave,
  deleteLeave,
  approveLeave,
  rejectLeave,
  getMyLeaves,
  getLeavesByEmployee,
  getMonthlyLeaveReport,
} from '../controllers/leave.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import {
  createLeaveSchema,
  updateLeaveSchema,
  leaveIdSchema,
  leaveQuerySchema,
  leaveApprovalSchema,
  employeeIdSchema,
  monthlyLeaveReportSchema,
} from '../validators/leave.validator.js';

const router = Router();

router.post('/', authenticate, authorize('EMPLOYEE', 'MANAGER', 'HR_ADMIN', 'SUPER_ADMIN'), validate(createLeaveSchema), createLeave);
router.get('/', authenticate, authorize('EMPLOYEE', 'MANAGER', 'HR_ADMIN', 'SUPER_ADMIN'), validate(leaveQuerySchema), getAllLeaves);
router.get('/my-leaves', authenticate, authorize('EMPLOYEE', 'MANAGER', 'HR_ADMIN', 'SUPER_ADMIN'), validate(leaveQuerySchema), getMyLeaves);
router.get('/employee/:employeeId', authenticate, authorize('HR_ADMIN', 'SUPER_ADMIN', 'MANAGER'), validate(employeeIdSchema), getLeavesByEmployee);
router.get('/report/monthly', authenticate, authorize('HR_ADMIN', 'SUPER_ADMIN', 'MANAGER'), validate(monthlyLeaveReportSchema), getMonthlyLeaveReport);
router.get('/:id', authenticate, authorize('EMPLOYEE', 'MANAGER', 'HR_ADMIN', 'SUPER_ADMIN'), validate(leaveIdSchema), getLeaveById);
router.put('/:id', authenticate, authorize('EMPLOYEE', 'MANAGER', 'HR_ADMIN', 'SUPER_ADMIN'), validate(leaveIdSchema), validate(updateLeaveSchema), updateLeave);
router.patch('/:id/approve', authenticate, authorize('HR_ADMIN', 'SUPER_ADMIN'), validate(leaveIdSchema), validate(leaveApprovalSchema), approveLeave);
router.patch('/:id/reject', authenticate, authorize('HR_ADMIN', 'SUPER_ADMIN'), validate(leaveIdSchema), validate(leaveApprovalSchema), rejectLeave);
router.delete('/:id', authenticate, authorize('HR_ADMIN', 'SUPER_ADMIN'), validate(leaveIdSchema), deleteLeave);

export default router;
