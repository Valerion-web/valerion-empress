import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { upload } from '../config/multer.js';
import { uploadDocument, listDocuments, getDocument, deleteDocument, employeeDocuments } from '../controllers/document.controller.js';
import { uploadDocumentSchema, documentIdSchema, documentQuerySchema, employeeIdParamSchema } from '../validators/document.validator.js';

const router = Router();
const hr = authorize('HR_ADMIN', 'SUPER_ADMIN');

router.post('/', authenticate, upload.single('file'), validate(uploadDocumentSchema), uploadDocument);
router.get('/', authenticate, validate(documentQuerySchema), listDocuments);
router.get('/employee/:employeeId', authenticate, validate(employeeIdParamSchema), employeeDocuments);
router.get('/:id', authenticate, validate(documentIdSchema), getDocument);
router.delete('/:id', authenticate, validate(documentIdSchema), deleteDocument);

export default router;
