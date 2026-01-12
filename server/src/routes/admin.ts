import { Router } from "express";
import {
  getAllUsers,
  getAllStudents,
  getAllMentors,
  getStudentById,
  getMentorById,
  updateUserStatus,
  getUsersByRole,
  activateUser,
  deactivateUser,
  deleteUser,
  assignBatch,
  updateMentorBatches,
} from "../controller/admin";
import { getAllBatchDetails, getBatchById } from "../controller/batch";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import * as assignmentController from "../controller/assignments";
import * as attendanceController from "../controller/attendance";
import * as sessionController from "../controller/sessions";
import * as notificationController from "../controller/notifications";
import * as externalActivityController from "../controller/externalActivities";
import * as skillController from "../controller/skills";

const router: Router = Router();

// Existing Admin User Management
router.get("/users", authMiddleware, requireRole("admin"), getAllUsers);
router.get("/students", authMiddleware, requireRole("admin"), getAllStudents);
router.get("/mentors", authMiddleware, requireRole("admin"), getAllMentors);
router.get(
  "/students/:id",
  authMiddleware,
  requireRole("admin"),
  getStudentById
);
router.get("/mentors/:id", authMiddleware, requireRole("admin"), getMentorById);
router.put(
  "/update-status/:id",
  authMiddleware,
  requireRole("admin"),
  updateUserStatus
);
router.get(
  "/getUsersByRole/:role",
  authMiddleware,
  requireRole("admin"),
  getUsersByRole
);
router.put("/activate/:id", authMiddleware, requireRole("admin"), activateUser);
router.put(
  "/deactivate/:id",
  authMiddleware,
  requireRole("admin"),
  deactivateUser
);
router.patch(
  "/users/:userId/batch",
  authMiddleware,
  requireRole("admin"),
  assignBatch
);
router.patch(
  "/mentors/:userId/batches",
  authMiddleware,
  requireRole("admin"),
  updateMentorBatches
);
router.delete("/delete/:id", authMiddleware, requireRole("admin"), deleteUser);

// Batch Management
router.get("/batches", authMiddleware, requireRole("admin"), getAllBatchDetails);
router.get("/batches/:batchId", authMiddleware, requireRole("admin"), getBatchById);

// Assignments
router.post(
  "/assignments",
  authMiddleware,
  requireRole("admin", "mentor"),
  assignmentController.createAssignment
);
router.get(
  "/assignments",
  authMiddleware,
  requireRole("admin"),
  assignmentController.getAllAssignments
);
router.get(
  "/assignments/:id",
  authMiddleware,
  requireRole("admin"),
  assignmentController.getAssignmentById
);
router.patch(
  "/assignments/:id",
  authMiddleware,
  requireRole("admin"),
  assignmentController.updateAssignment
);
router.delete(
  "/assignments/:id",
  authMiddleware,
  requireRole("admin"),
  assignmentController.deleteAssignment
);
router.patch(
  "/assignments/grade/:studentAssignmentId",
  authMiddleware,
  requireRole("admin"),
  assignmentController.gradeAssignment
);

// Attendance
router.get(
  "/attendance/session/:sessionId",
  authMiddleware,
  requireRole("admin"),
  attendanceController.getSessionAttendance
);
router.patch(
  "/attendance/approve/:attendanceId",
  authMiddleware,
  requireRole("admin"),
  attendanceController.approveAttendance
);

// Sessions
router.post(
  "/sessions/mentorship",
  authMiddleware,
  requireRole("admin"),
  sessionController.createMentorshipSession
);
router.get(
  "/sessions/mentorship",
  authMiddleware,
  requireRole("admin"),
  sessionController.getMentorshipSessions
);
router.patch(
  "/sessions/mentorship/:id",
  authMiddleware,
  requireRole("admin"),
  sessionController.updateMentorshipSession
);
router.get(
  "/sessions/learning/:userId",
  authMiddleware,
  requireRole("admin"),
  sessionController.getStudentLearningSessions
);

// Notifications
router.post(
  "/notifications",
  authMiddleware,
  requireRole("admin"),
  notificationController.createNotification
);



// Skills
router.get(
  "/skills",
  authMiddleware,
  requireRole("admin"),
  skillController.getAllSkills
);
router.post(
  "/skills/topics",
  authMiddleware,
  requireRole("admin"),
  skillController.createSkillTopic
);
router.get(
  "/skills/topics/:skillId",
  authMiddleware,
  requireRole("admin"),
  skillController.getSkillTopics
);
router.patch(
  "/skills/topics/:id",
  authMiddleware,
  requireRole("admin"),
  skillController.updateSkillTopic
);
router.delete(
  "/skills/topics/:id",
  authMiddleware,
  requireRole("admin"),
  skillController.deleteSkillTopic
);
router.get(
  "/skills/progress/:userId",
  authMiddleware,
  requireRole("admin"),
  skillController.getStudentSkillProgress
);

export default router;
