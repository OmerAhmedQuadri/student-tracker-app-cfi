import { createAdmin, createMentor, createStudent, login, logout, updateUserStatus } from  "../controller/user";
import { Router } from "express";
import { requireRole } from "../middleware/role.middleware";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/admin", createAdmin);
router.post("/students", authMiddleware, requireRole("admin"), createStudent);
router.post("/mentors", authMiddleware, requireRole("admin"), createMentor);
router.put("/update-status/:id", authMiddleware, requireRole("admin"), updateUserStatus);
router.post("/login", login);
router.post("/logout", logout);

export default router;