import { Router } from 'express';
import { getEmployee, listEmployees, updateEmployee } from '../controllers/employee.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

router.get('/', authenticate, authorize('HR_ADMIN', 'SUPER_ADMIN', 'MANAGER'), listEmployees);
router.get('/:id', authenticate, authorize('HR_ADMIN', 'SUPER_ADMIN', 'MANAGER', 'EMPLOYEE'), getEmployee);
router.put('/:id', authenticate, authorize('HR_ADMIN', 'SUPER_ADMIN'), updateEmployee);

export default router;
