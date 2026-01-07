import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import * as assignmentController from "../controller/assignments";
import * as attendanceController from "../controller/attendance";
import * as sessionController from "../controller/sessions";
import * as notificationController from "../controller/notifications";
import * as externalActivityController from "../controller/externalActivities";
import * as skillController from "../controller/skills";

const router: Router = Router();

router.use(authMiddleware);
router.use(requireRole("mentor"));

// Assignments
router.post("/assignments", assignmentController.createAssignment);
router.get("/assignments", assignmentController.getAllAssignments);
router.get("/assignments/:id", assignmentController.getAssignmentById);
router.patch("/assignments/:id", assignmentController.updateAssignment);
router.delete("/assignments/:id", assignmentController.deleteAssignment);
router.patch(
  "/assignments/grade/:studentAssignmentId",
  assignmentController.gradeAssignment
);

// Attendance
router.get(
  "/attendance/session/:sessionId",
  attendanceController.getSessionAttendance
);
router.patch(
  "/attendance/approve/:attendanceId",
  attendanceController.approveAttendance
);

// Sessions
router.post("/sessions/mentorship", sessionController.createMentorshipSession);
router.get("/sessions/mentorship", sessionController.getMentorshipSessions);
router.patch(
  "/sessions/mentorship/:id",
  sessionController.updateMentorshipSession
);
router.get(
  "/sessions/learning/:userId",
  sessionController.getStudentLearningSessions
);

// Notifications
router.post("/notifications", notificationController.createNotification);

// External Activities
router.get(
  "/external-activities/:userId",
  externalActivityController.getUserExternalActivities
);

// Skills
router.get("/skills", skillController.getAllSkills);
router.post("/skills/topics", skillController.createSkillTopic);
router.get("/skills/topics/:skillId", skillController.getSkillTopics);
router.patch("/skills/topics/:id", skillController.updateSkillTopic);
router.delete("/skills/topics/:id", skillController.deleteSkillTopic);
router.get("/skills/progress/:userId", skillController.getStudentSkillProgress);

export default router;
