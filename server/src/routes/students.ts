import { Router } from "express";
import { addSocialMediaLinks } from "../controller/students";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import * as assignmentController from "../controller/assignments";
import * as attendanceController from "../controller/attendance";
import * as sessionController from "../controller/sessions";
import * as notificationController from "../controller/notifications";
import * as externalActivityController from "../controller/externalActivities";
import * as skillController from "../controller/skills";

const router: Router = Router();

router.put(
  "/students/me/socials",
  authMiddleware,
  requireRole("student"),
  addSocialMediaLinks
);

// Assignments
router.get(
  "/assignments",
  authMiddleware,
  assignmentController.getAllAssignments
);
router.get(
  "/assignments/my",
  authMiddleware,
  requireRole("student"),
  assignmentController.getMyAssignments
);
router.get(
  "/assignments/:id",
  authMiddleware,
  assignmentController.getAssignmentById
);
router.post(
  "/assignments/submit",
  authMiddleware,
  requireRole("student"),
  assignmentController.submitAssignment
);

// Attendance
router.post(
  "/attendance/mark",
  authMiddleware,
  requireRole("student"),
  attendanceController.markAttendance
);
router.get(
  "/attendance/my",
  authMiddleware,
  requireRole("student"),
  attendanceController.getMyAttendance
);

// Sessions
router.get(
  "/sessions/mentorship",
  authMiddleware,
  sessionController.getMentorshipSessions
);
router.post(
  "/sessions/learning",
  authMiddleware,
  requireRole("student"),
  sessionController.logLearningSession
);
router.get(
  "/sessions/learning/my",
  authMiddleware,
  requireRole("student"),
  sessionController.getMyLearningSessions
);

// Notifications
router.get(
  "/notifications",
  authMiddleware,
  notificationController.getMyNotifications
);
router.patch(
  "/notifications/:id/read",
  authMiddleware,
  notificationController.markAsRead
);

// External Activities
router.post(
  "/external-activities",
  authMiddleware,
  requireRole("student"),
  externalActivityController.logExternalActivity
);
router.get(
  "/external-activities/my",
  authMiddleware,
  requireRole("student"),
  externalActivityController.getMyExternalActivities
);
router.post(
  "/external-activities/post",
  authMiddleware,
  requireRole("student"),
  externalActivityController.addBrandingPost
);
router.get(
  "/external-activities/posts/my",
  authMiddleware,
  requireRole("student"),
  externalActivityController.getMyBrandingPosts
);

// Skills
router.get("/skills", authMiddleware, skillController.getAllSkills);
router.get(
  "/skills/topics/:skillId",
  authMiddleware,
  skillController.getSkillTopics
);
router.post(
  "/skills/progress",
  authMiddleware,
  requireRole("student"),
  skillController.updateSkillProgress
);
router.get(
  "/skills/progress/my",
  authMiddleware,
  requireRole("student"),
  skillController.getMySkillProgress
);

export default router;
