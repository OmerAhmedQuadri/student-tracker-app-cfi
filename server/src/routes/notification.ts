import express from "express";
import { sendAbsenteeWarning } from "../controller/notification";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";

const router = express.Router();

// Only mentors and admins should be able to trigger this manually via API
router.post("/absentee-alert", authMiddleware, requireRole("mentor", "admin"), sendAbsenteeWarning);

export default router;
