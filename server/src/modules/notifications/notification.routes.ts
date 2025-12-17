import { Router } from 'express';
import * as notificationController from './notification.controller';
import { protect } from '../auth/auth.middleware';

const router = Router();

router.route('/')
  .get(protect, notificationController.getNotifications);

router.route('/:id/read')
  .put(protect, notificationController.markAsRead);

export default router;
