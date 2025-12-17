import { Router } from 'express';
import * as assignmentController from './assignment.controller';
import { protect, mentor } from '../auth/auth.middleware';
import { requireFields } from '../../middlewares/validate.middleware';

const router = Router();

// Student: list own assignments
// Mentor/Admin: list by ?studentId=...
router.get('/', protect, assignmentController.getAssignments);

// Mentor/Admin: create for a student
router.post(
  '/',
  protect,
  mentor,
  requireFields('body', ['studentId', 'title']),
  assignmentController.createAssignment
);

// Student: submit
router.put('/:id/submit', protect, assignmentController.submitAssignment);

// Mentor/Admin: review
router.put('/:id/review', protect, mentor, assignmentController.reviewAssignment);

export default router;
