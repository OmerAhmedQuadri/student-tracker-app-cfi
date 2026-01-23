import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import * as assignmentController from "../controller/assignments";
import * as attendanceController from "../controller/attendance";
import * as sessionController from "../controller/sessions";
import * as notificationController from "../controller/notifications";
import * as externalActivityController from "../controller/externalActivities";
import { getAllStudents } from "../controller/admin";
import { getMyBatchStudents, getBatchAttendanceHistory, getMentorBatches, getBatchAttendanceByBatch, getStudentsByBatch } from "../controller/mentorStudents";

const router: Router = Router();

router.use(authMiddleware);
router.use(requireRole("mentor"));

// Students - batch-specific
router.get("/students", getMyBatchStudents);
router.get("/students/all", getAllStudents); // All students (for reference)
router.get("/students/batch/:batchId", getStudentsByBatch); // Get students by specific batch
router.get("/attendance/history", getBatchAttendanceHistory);
router.get("/batches", getMentorBatches); // Get all batches taught by mentor
router.get("/attendance/by-batch", getBatchAttendanceByBatch); // Get attendance filtered by batch

// Assignments
router.post("/assignments", assignmentController.createAssignment);
router.get("/assignments", assignmentController.getAllAssignments);
router.get("/assignments/:id", assignmentController.getAssignmentById);
router.patch("/assignments/:id", assignmentController.updateAssignment);
router.delete("/assignments/:id", assignmentController.deleteAssignment);

router.get(
  "/assignments/:assignmentId/submissions",
  assignmentController.getSubmissionsForAssignment
);

// Attendance
router.post(
  "/attendance/mark",
  attendanceController.mentorMarkAttendance
);
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
router.delete(
  "/sessions/mentorship/:id",
  sessionController.deleteMentorshipSession
);
router.get(
  "/sessions/learning/:userId",
  sessionController.getStudentLearningSessions
);

// Notifications
router.post("/notifications", notificationController.createNotification);

// External Activities
router.get(
  "/external-activities",
  externalActivityController.getAllExternalActivities
);
router.get(
  "/external-activities/:userId",
  externalActivityController.getUserExternalActivities
);
router.patch(
  "/external-activities/:activityId",
  externalActivityController.updateActivityStatus
);

export default router;
