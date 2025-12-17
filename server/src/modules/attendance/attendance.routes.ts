import { Router } from 'express';
import * as attendanceController from './attendance.controller';
import { protect, mentor } from '../auth/auth.middleware';

const router = Router();

router.route('/')
  .get(protect, attendanceController.getAttendance)
  .post(protect, attendanceController.markAttendance);

router.route('/:id/approve')
  .put(protect, mentor, attendanceController.approveAttendance);

export default router;
