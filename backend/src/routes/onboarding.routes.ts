import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import { upload } from '../config/multer.js';
import {
  approveOnboardingRecord,
  assignOnboardingTasks,
  createOnboardingRecord,
  createResignationRequest,
  getMyOnboardingChecklist,
  getOnboardingDashboard,
  getOnboardingRecord,
  listOffboardingRecords,
  listOnboardingRecords,
  updateAssetReturn,
  updateClearance,
  updateExitInterview,
  updateFinalSettlement,
  updateOffboardingStatus,
  updateOnboardingTask,
  uploadOnboardingDocument,
} from '../controllers/onboarding.controller.js';

const router = Router();
const hrAccess = authorize('HR_ADMIN', 'SUPER_ADMIN');
const managerOrHr = authorize('MANAGER', 'HR_ADMIN', 'SUPER_ADMIN');

router.get('/dashboard', authenticate, hrAccess, getOnboardingDashboard);
router.get('/my-checklist', authenticate, getMyOnboardingChecklist);
router.get('/', authenticate, listOnboardingRecords);
router.get('/:id', authenticate, getOnboardingRecord);
router.post('/', authenticate, managerOrHr, createOnboardingRecord);
router.post('/:id/tasks', authenticate, managerOrHr, assignOnboardingTasks);
router.patch('/:id/tasks/:taskId', authenticate, managerOrHr, updateOnboardingTask);
router.post('/:id/documents', authenticate, upload.single('file'), uploadOnboardingDocument);
router.patch('/:id/approve', authenticate, hrAccess, approveOnboardingRecord);

router.get('/resignations', authenticate, listOffboardingRecords);
router.post('/resignations', authenticate, createResignationRequest);
router.patch('/:id/exit-interview', authenticate, updateExitInterview);
router.patch('/:id/asset-return', authenticate, updateAssetReturn);
router.patch('/:id/clearance', authenticate, updateClearance);
router.patch('/:id/settlement', authenticate, updateFinalSettlement);
router.patch('/:id/status', authenticate, updateOffboardingStatus);

export default router;
