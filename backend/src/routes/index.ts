import { Router } from 'express';
import authRoutes from './auth.routes.js';
import employeeRoutes from './employee.routes.js';
import departmentRoutes from './department.routes.js';
import attendanceRoutes from './attendance.routes.js';
import leaveRoutes from './leave.routes.js';
import payrollRoutes from './payroll.routes.js';
import performanceRoutes from './performance.routes.js';
import recruitmentRoutes from './recruitment.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import assetRoutes from './asset.routes.js';
import documentRoutes from './document.routes.js';
import notificationRoutes from './notification.routes.js';
import trainingRoutes from './training.routes.js';
import reportRoutes from './report.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/employees', employeeRoutes);
router.use('/departments', departmentRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/leaves', leaveRoutes);
router.use('/payroll', payrollRoutes);
router.use('/performance', performanceRoutes);
router.use('/recruitment', recruitmentRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/assets', assetRoutes);
router.use('/documents', documentRoutes);
router.use('/notifications', notificationRoutes);
router.use('/trainings', trainingRoutes);
router.use('/reports', reportRoutes);

export default router;
