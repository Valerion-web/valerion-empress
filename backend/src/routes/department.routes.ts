import { Router } from 'express';
import {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  searchDepartments,
  filterDepartments,
} from '../controllers/department.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import {
  createDepartmentSchema,
  updateDepartmentSchema,
  searchDepartmentSchema,
  filterDepartmentSchema,
  paginationSchema,
  departmentIdSchema,
} from '../validators/department.validator.js';

const router = Router();

router.post(
  '/',
  authenticate,
  authorize('HR_ADMIN'),
  validate(createDepartmentSchema),
  createDepartment
);

router.get(
  '/',
  authenticate,
  validate(paginationSchema),
  getAllDepartments
);

router.get(
  '/search',
  authenticate,
  validate(searchDepartmentSchema),
  searchDepartments
);

router.get(
  '/filter',
  authenticate,
  validate(filterDepartmentSchema),
  filterDepartments
);

router.get(
  '/:id',
  authenticate,
  validate(departmentIdSchema),
  getDepartmentById
);

router.put(
  '/:id',
  authenticate,
  authorize('HR_ADMIN'),
  validate(departmentIdSchema),
  validate(updateDepartmentSchema),
  updateDepartment
);

router.delete(
  '/:id',
  authenticate,
  authorize('HR_ADMIN'),
  validate(departmentIdSchema),
  deleteDepartment
);

export default router;
