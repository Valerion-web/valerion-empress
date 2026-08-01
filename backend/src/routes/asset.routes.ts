import { Router } from 'express';
import { z } from 'zod';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import {
  listAssets, getAsset, createAsset, updateAsset, deleteAsset, assignAsset, returnAsset, listHistory,
  listCategories, createCategory, updateCategory, deleteCategory, employeeAssets,
} from '../controllers/asset.controller.js';
import {
  assetIdSchema, assetQuerySchema, createAssetSchema, updateAssetSchema, assignmentSchema,
  historyQuerySchema, categoryIdSchema, createCategorySchema, updateCategorySchema,
} from '../validators/asset.validator.js';

const returnSchema = z.object({ body: z.object({ notes: z.string().max(500).optional() }) });
const router = Router();
const hr = authorize('HR_ADMIN', 'SUPER_ADMIN');

router.get('/my-assets', authenticate, employeeAssets);
router.get('/categories', authenticate, listCategories);
router.post('/categories', authenticate, hr, validate(createCategorySchema), createCategory);
router.put('/categories/:id', authenticate, hr, validate(categoryIdSchema), validate(updateCategorySchema), updateCategory);
router.delete('/categories/:id', authenticate, hr, validate(categoryIdSchema), deleteCategory);
router.get('/', authenticate, validate(assetQuerySchema), listAssets);
router.post('/', authenticate, hr, validate(createAssetSchema), createAsset);
router.post('/:id/assign', authenticate, hr, validate(assetIdSchema), validate(assignmentSchema), assignAsset);
router.post('/:id/return', authenticate, hr, validate(assetIdSchema), validate(returnSchema), returnAsset);
router.get('/:id/history', authenticate, validate(assetIdSchema), validate(historyQuerySchema), listHistory);
router.get('/:id', authenticate, validate(assetIdSchema), getAsset);
router.put('/:id', authenticate, hr, validate(assetIdSchema), validate(updateAssetSchema), updateAsset);
router.delete('/:id', authenticate, hr, validate(assetIdSchema), deleteAsset);

export default router;
