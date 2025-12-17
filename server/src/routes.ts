import { Router } from 'express';
import userRoutes from './modules/user/user.routes';
import authRoutes from './modules/auth/auth.routes';
import skillRoutes from './modules/skills/skill.routes';
import activityRoutes from './modules/activities/activity.routes';
import attendanceRoutes from './modules/attendance/attendance.routes';
import notificationRoutes from './modules/notifications/notification.routes';
import leaderboardRoutes from './modules/leaderboard/leaderboard.routes';
import assignmentRoutes from './modules/assignments/assignment.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';
import integrationsRoutes from './integrations/integrations.routes';

const router = Router();

router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/skills', skillRoutes);
router.use('/activities', activityRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/notifications', notificationRoutes);
router.use('/leaderboard', leaderboardRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/integrations', integrationsRoutes);

export default router;
