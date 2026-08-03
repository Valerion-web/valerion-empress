import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import {
  getDashboardSummary,
  getAttendanceReport,
  getLeaveReport,
  getPayrollReport,
  getEmployeeReport,
  getRecruitmentReport,
  getPerformanceReport,
  exportReportCsv,
  exportReportExcel,
  exportReportPdf,
} from '../controllers/reports.controller.js';

const router = Router();
const hr = authorize('HR_ADMIN');

router.get('/summary', authenticate, hr, getDashboardSummary);
router.get('/attendance', authenticate, hr, getAttendanceReport);
router.get('/leave', authenticate, hr, getLeaveReport);
router.get('/payroll', authenticate, hr, getPayrollReport);
router.get('/employees', authenticate, hr, getEmployeeReport);
router.get('/recruitment', authenticate, hr, getRecruitmentReport);
router.get('/performance', authenticate, hr, getPerformanceReport);

router.get('/:type/export/csv', authenticate, hr, exportReportCsv);
router.get('/:type/export/excel', authenticate, hr, exportReportExcel);
router.get('/:type/export/pdf', authenticate, hr, exportReportPdf);

export default router;
