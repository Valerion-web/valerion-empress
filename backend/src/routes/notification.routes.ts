import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import {
  createNotification, listNotifications, getNotification, deleteNotification, myNotifications, markRead,
} from '../controllers/notification.controller.js';
import { createNotificationSchema, notificationIdSchema, notificationQuerySchema } from '../validators/notification.validator.js';

const router = Router();
const hr = authorize('HR_ADMIN', 'SUPER_ADMIN');

router.post('/', authenticate, hr, validate(createNotificationSchema), createNotification);
router.get('/', authenticate, validate(notificationQuerySchema), listNotifications);
router.get('/my-notifications', authenticate, myNotifications);
router.patch('/:id/read', authenticate, validate(notificationIdSchema), markRead);
router.get('/:id', authenticate, validate(notificationIdSchema), getNotification);
router.delete('/:id', authenticate, validate(notificationIdSchema), deleteNotification);

export default router;
