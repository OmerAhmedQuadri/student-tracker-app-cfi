import { Router } from 'express';
import * as activityController from './activity.controller';
import { protect } from '../auth/auth.middleware';

const router = Router();

router.route('/')
  .get(protect, activityController.getActivities)
  .post(protect, activityController.logActivity);

export default router;
