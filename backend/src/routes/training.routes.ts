import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import {
  createTraining, listTrainings, getTraining, updateTraining, deleteTraining, assignTraining, myTrainings, completeTraining, trainingAssignments,
} from '../controllers/training.controller.js';
import { createTrainingSchema, trainingIdSchema, assignSchema, paginationQuery, updateTrainingSchema } from '../validators/training.validator.js';

const router = Router();
const hr = authorize('HR_ADMIN', 'SUPER_ADMIN');
const hrManager = authorize('HR_ADMIN', 'SUPER_ADMIN', 'MANAGER');

router.post('/', authenticate, hr, validate(createTrainingSchema), createTraining);
router.get('/', authenticate, validate(paginationQuery), listTrainings);
router.get('/my-trainings', authenticate, myTrainings);
router.get('/:id', authenticate, validate(trainingIdSchema), getTraining);
router.put('/:id', authenticate, hr, validate(trainingIdSchema), validate(updateTrainingSchema), updateTraining);
router.delete('/:id', authenticate, hr, validate(trainingIdSchema), deleteTraining);
router.post('/:id/assign', authenticate, hrManager, validate(trainingIdSchema), validate(assignSchema), assignTraining);
router.patch('/:id/complete', authenticate, validate(trainingIdSchema), completeTraining);
router.get('/:id/assignments', authenticate, hr, validate(trainingIdSchema), trainingAssignments);

export default router;
