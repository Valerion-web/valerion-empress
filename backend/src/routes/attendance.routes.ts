import { Router } from 'express';
import {
  getAllAttendance,
  getAttendanceById,
  getAttendanceByEmployee,
  getAttendanceByDate,
  getMonthlyAttendanceReport,
  searchAttendances,
  filterAttendances,
  checkInAttendance,
  checkOutAttendance,
  updateAttendance,
  deleteAttendance,
} from '../controllers/attendance.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import {
  attendanceIdSchema,
  attendanceDateSchema,
  attendanceEmployeeSchema,
  paginationSchema,
  searchAttendanceSchema,
  filterAttendanceSchema,
  checkInSchema,
  checkOutSchema,
  updateAttendanceSchema,
  reportAttendanceSchema,
} from '../validators/attendance.validator.js';

const router = Router();

router.post(
  '/check-in',
  authenticate,
  authorize('EMPLOYEE', 'MANAGER', 'HR_ADMIN', 'SUPER_ADMIN'),
  validate(checkInSchema),
  checkInAttendance
);

router.post(
  '/check-out/:id',
  authenticate,
  authorize('EMPLOYEE', 'MANAGER', 'HR_ADMIN', 'SUPER_ADMIN'),
  validate(attendanceIdSchema),
  validate(checkOutSchema),
  checkOutAttendance
);

router.get(
  '/',
  authenticate,
  validate(paginationSchema),
  getAllAttendance
);

router.get(
  '/search',
  authenticate,
  validate(searchAttendanceSchema),
  searchAttendances
);

router.get(
  '/filter',
  authenticate,
  validate(filterAttendanceSchema),
  filterAttendances
);

router.get(
  '/report',
  authenticate,
  authorize('HR_ADMIN', 'SUPER_ADMIN', 'MANAGER'),
  validate(reportAttendanceSchema),
  getMonthlyAttendanceReport
);

router.get(
  '/date',
  authenticate,
  validate(attendanceDateSchema),
  getAttendanceByDate
);

router.get(
  '/employee/:userId',
  authenticate,
  validate(attendanceEmployeeSchema),
  getAttendanceByEmployee
);

router.get(
  '/:id',
  authenticate,
  validate(attendanceIdSchema),
  getAttendanceById
);

router.put(
  '/:id',
  authenticate,
  authorize('HR_ADMIN', 'SUPER_ADMIN', 'MANAGER'),
  validate(attendanceIdSchema),
  validate(updateAttendanceSchema),
  updateAttendance
);

router.delete(
  '/:id',
  authenticate,
  authorize('HR_ADMIN', 'SUPER_ADMIN'),
  validate(attendanceIdSchema),
  deleteAttendance
);

export default router;
