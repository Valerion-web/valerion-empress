import { Router } from 'express';
import { getAttendanceReport, markAttendance } from '../controllers/attendance.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

router.get('/report', authenticate, authorize('HR_ADMIN', 'SUPER_ADMIN', 'MANAGER'), getAttendanceReport);
router.post('/mark', authenticate, authorize('EMPLOYEE', 'MANAGER', 'HR_ADMIN', 'SUPER_ADMIN'), markAttendance);

export default router;
