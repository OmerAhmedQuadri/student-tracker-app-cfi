import {Router} from "express";
import {getAllStudents, getAllMentors, getStudentById, getMentorById} from "../controller/admin";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";

const router = Router();

router.get("/students", authMiddleware, requireRole("admin"), getAllStudents);
router.get("/mentors", authMiddleware, requireRole("admin"), getAllMentors);
router.get("/students/:id", authMiddleware, requireRole("admin"), getStudentById);
router.get("/mentors/:id", authMiddleware, requireRole("admin"), getMentorById);

export default router;

