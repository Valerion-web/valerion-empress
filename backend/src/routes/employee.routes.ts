import { Router, Request, Response, NextFunction } from 'express';
import {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  searchEmployees,
  filterEmployees,
  getEmployeesByDepartment,
  getEmployeesByStatus,
  getTotalEmployeeCount,
} from '../controllers/employee.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  searchEmployeeSchema,
  filterEmployeeSchema,
  paginationSchema,
  employeeIdSchema,
  departmentIdSchema,
  statusSchema,
} from '../validators/employee.validator.js';

const router = Router();

/**
 * Create Employee
 * POST /api/v1/employees
 * Authorization: SUPER_ADMIN, HR_ADMIN
 */
router.post(
  '/',
  authenticate,
  authorize('SUPER_ADMIN', 'HR_ADMIN'),
  validate(createEmployeeSchema),
  createEmployee
);

/**
 * Get All Employees with Pagination
 * GET /api/v1/employees
 * Authorization: Authenticated users
 */
router.get(
  '/',
  authenticate,
  validate(paginationSchema),
  getAllEmployees
);

/**
 * Search Employees
 * GET /api/v1/employees/search
 * Authorization: Authenticated users
 * Query Parameters: q (required), page, limit
 */
router.get(
  '/search',
  authenticate,
  validate(searchEmployeeSchema),
  searchEmployees
);

/**
 * Filter Employees
 * GET /api/v1/employees/filter
 * Authorization: Authenticated users
 * Query Parameters: departmentId, status, designationId, employmentType, page, limit, sortBy, sortOrder
 */
router.get(
  '/filter',
  authenticate,
  validate(filterEmployeeSchema),
  filterEmployees
);

/**
 * Get Total Employee Count
 * GET /api/v1/employees/count
 * Authorization: Authenticated users
 */
router.get(
  '/count',
  authenticate,
  getTotalEmployeeCount
);

/**
 * Get Employees by Department
 * GET /api/v1/employees/department/:departmentId
 * Authorization: Authenticated users
 */
router.get(
  '/department/:departmentId',
  authenticate,
  validate(departmentIdSchema),
  getEmployeesByDepartment
);

/**
 * Get Employees by Status
 * GET /api/v1/employees/status/:status
 * Authorization: Authenticated users
 */
router.get(
  '/status/:status',
  authenticate,
  validate(statusSchema),
  getEmployeesByStatus
);

/**
 * Get Employee by ID
 * GET /api/v1/employees/:id
 * Authorization: Authenticated users (Employee can only view own profile)
 */
router.get(
  '/:id',
  authenticate,
  validate(employeeIdSchema),
  (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    const targetEmployeeId = req.params.id;

    // Allow if SUPER_ADMIN or HR_ADMIN
    if (user.role === 'SUPER_ADMIN' || user.role === 'HR_ADMIN') {
      return next();
    }

    // Allow employee to view only their own profile
    if (user.role === 'EMPLOYEE' && user.id !== targetEmployeeId) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own profile',
        data: null,
        errors: [],
        statusCode: 403,
      });
    }

    next();
  },
  getEmployeeById
);

/**
 * Update Employee
 * PUT /api/v1/employees/:id
 * Authorization: SUPER_ADMIN, HR_ADMIN
 */
router.put(
  '/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'HR_ADMIN'),
  validate(employeeIdSchema),
  validate(updateEmployeeSchema),
  updateEmployee
);

/**
 * Delete Employee
 * DELETE /api/v1/employees/:id
 * Authorization: SUPER_ADMIN, HR_ADMIN
 */
router.delete(
  '/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'HR_ADMIN'),
  validate(employeeIdSchema),
  deleteEmployee
);

export default router;
