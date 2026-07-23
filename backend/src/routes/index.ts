import { Router } from 'express';
import authRoutes from './auth.routes.js';
import employeeRoutes from './employee.routes.js';
import departmentRoutes from './department.routes.js';
import attendanceRoutes from './attendance.routes.js';
import leaveRoutes from './leave.routes.js';
import dashboardRoutes from './dashboard.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/employees', employeeRoutes);
router.use('/departments', departmentRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/leave', leaveRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
