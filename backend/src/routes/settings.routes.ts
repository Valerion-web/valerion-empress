import { Router } from 'express';
import {
  createDepartment,
  createDesignation,
  createOfficeLocation,
  createShift,
  deleteDepartment,
  deleteDesignation,
  deleteOfficeLocation,
  deleteShift,
  getCompanyProfile,
  getLeavePolicy,
  getPayrollSettings,
  listDepartments,
  listDesignations,
  listOfficeLocations,
  listShifts,
  updateCompanyProfile,
  updateDepartment,
  updateDesignation,
  updateLeavePolicy,
  updateOfficeLocation,
  updatePayrollSettings,
  updateShift,
} from '../controllers/settings.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate);
router.use(authorize('HR_ADMIN', 'SUPER_ADMIN'));

router.get('/company-profile', getCompanyProfile);
router.put('/company-profile', updateCompanyProfile);

router.get('/departments', listDepartments);
router.post('/departments', createDepartment);
router.put('/departments/:id', updateDepartment);
router.delete('/departments/:id', deleteDepartment);

router.get('/designations', listDesignations);
router.post('/designations', createDesignation);
router.put('/designations/:id', updateDesignation);
router.delete('/designations/:id', deleteDesignation);

router.get('/office-locations', listOfficeLocations);
router.post('/office-locations', createOfficeLocation);
router.put('/office-locations/:id', updateOfficeLocation);
router.delete('/office-locations/:id', deleteOfficeLocation);

router.get('/shifts', listShifts);
router.post('/shifts', createShift);
router.put('/shifts/:id', updateShift);
router.delete('/shifts/:id', deleteShift);

router.get('/leave-policy', getLeavePolicy);
router.put('/leave-policy', updateLeavePolicy);

router.get('/payroll-settings', getPayrollSettings);
router.put('/payroll-settings', updatePayrollSettings);

export default router;
