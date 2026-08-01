import { Router } from 'express';
import {
  createPayroll,
  getAllPayrolls,
  getPayrollById,
  updatePayroll,
  deletePayroll,
  getPayrollByEmployee,
  getMonthlyPayroll,
  getYearlyPayroll,
} from '../controllers/payroll.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import {
  createPayrollSchema,
  updatePayrollSchema,
  payrollIdSchema,
  employeeIdSchema,
  payrollQuerySchema,
  monthlyPayrollSchema,
  yearlyPayrollSchema,
} from '../validators/payroll.validator.js';

const router = Router();

router.post(
  '/',
  authenticate,
  authorize('HR_ADMIN'),
  validate(createPayrollSchema),
  createPayroll
);

router.get('/', authenticate, authorize('HR_ADMIN', 'EMPLOYEE'), validate(payrollQuerySchema), getAllPayrolls);
router.get('/employee/:employeeId', authenticate, authorize('HR_ADMIN', 'EMPLOYEE'), validate(employeeIdSchema), getPayrollByEmployee);
router.get('/monthly', authenticate, authorize('HR_ADMIN', 'EMPLOYEE'), validate(monthlyPayrollSchema), getMonthlyPayroll);
router.get('/yearly', authenticate, authorize('HR_ADMIN', 'EMPLOYEE'), validate(yearlyPayrollSchema), getYearlyPayroll);
router.get('/:id', authenticate, authorize('HR_ADMIN', 'EMPLOYEE'), validate(payrollIdSchema), getPayrollById);
router.put('/:id', authenticate, authorize('HR_ADMIN'), validate(payrollIdSchema), validate(updatePayrollSchema), updatePayroll);
router.delete('/:id', authenticate, authorize('HR_ADMIN'), validate(payrollIdSchema), deletePayroll);

export default router;
