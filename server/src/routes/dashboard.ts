import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import {
  getStudentDashboard,
  getMentorDashboard,
  getLeaderboard,
} from "../controller/dashboard";

const router = Router();

router.use(authMiddleware);

router.get("/student", requireRole("student"), getStudentDashboard);
router.get("/mentor", requireRole("mentor", "admin"), getMentorDashboard);
router.get("/leaderboard", getLeaderboard);

export default router;
