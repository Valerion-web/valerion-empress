import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import {
  exportAuditCsv,
  exportAuditPdf,
  listAuditLogs,
  logAction,
} from '../controllers/audit.controller.js';

const router = Router();

router.use(authenticate);
router.use(authorize('HR_ADMIN', 'SUPER_ADMIN'));

router.get('/', listAuditLogs);
router.post('/track', logAction);
router.get('/export/csv', exportAuditCsv);
router.get('/export/pdf', exportAuditPdf);

export default router;
