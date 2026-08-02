import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import * as ctrl from '../controllers/report.controller.js';

const router = Router();
const hr = authorize('HR_ADMIN');

router.get('/employees', authenticate, hr, ctrl.employees);
router.get('/attendance', authenticate, hr, ctrl.attendance);
router.get('/leaves', authenticate, hr, ctrl.leaves);
router.get('/payroll', authenticate, hr, ctrl.payroll);
router.get('/trainings', authenticate, hr, ctrl.trainings);
router.get('/recruitment', authenticate, hr, ctrl.recruitment);
router.get('/assets', authenticate, hr, ctrl.assets);

// Exports for employees
router.get('/employees/export/csv', authenticate, hr, ctrl.exportEmployeesCSV);
router.get('/employees/export/excel', authenticate, hr, ctrl.exportEmployeesExcel);
router.get('/employees/export/pdf', authenticate, hr, ctrl.exportEmployeesPDF);

// Generic CSV exports for other types
router.get('/attendance/export/csv', authenticate, hr, (req, res) => ctrl.exportGenericCSV(req, res, 'attendance'));
router.get('/leaves/export/csv', authenticate, hr, (req, res) => ctrl.exportGenericCSV(req, res, 'leaves'));
router.get('/payroll/export/csv', authenticate, hr, (req, res) => ctrl.exportGenericCSV(req, res, 'payroll'));
router.get('/trainings/export/csv', authenticate, hr, (req, res) => ctrl.exportGenericCSV(req, res, 'trainings'));
router.get('/recruitment/export/csv', authenticate, hr, (req, res) => ctrl.exportGenericCSV(req, res, 'recruitment'));
router.get('/assets/export/csv', authenticate, hr, (req, res) => ctrl.exportGenericCSV(req, res, 'assets'));

export default router;
