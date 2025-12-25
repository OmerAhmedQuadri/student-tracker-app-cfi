import { Router } from 'express';
import { protect, mentor } from '../auth/auth.middleware';
import * as analyticsController from './analytics.controller';

const router = Router();

// Student
router.get('/me/summary', protect, analyticsController.getMySummary);
router.get('/me/weaknesses', protect, analyticsController.getMyWeaknesses);

// Mentor/Admin
router.get('/dashboard', protect, mentor, analyticsController.getDashboard);

export default router;
