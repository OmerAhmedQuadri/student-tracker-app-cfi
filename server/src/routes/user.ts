import { createStudent, login } from  "../controller/user";
import { Router } from "express";
import { requireRole } from "../middleware/role.middleware";

const router = Router();

router.post("/students", requireRole("admin"), createStudent);
router.post("/login", login);

export default router;