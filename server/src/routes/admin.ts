import {Router} from "express";
import {getAllStudents, getAllMentors, getStudentById, getMentorById, updateUserStatus, getUsersByRole, activateUser, deactivateUser, deleteUser} from "../controller/admin";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";

const router: Router = Router();

router.get("/students", authMiddleware, requireRole("admin"), getAllStudents);
router.get("/mentors", authMiddleware, requireRole("admin"), getAllMentors);
router.get("/students/:id", authMiddleware, requireRole("admin"), getStudentById);
router.get("/mentors/:id", authMiddleware, requireRole("admin"), getMentorById);
router.put("/update-status/:id", authMiddleware, requireRole("admin"), updateUserStatus);
router.get("/getUsersByRole/:role", authMiddleware , requireRole("admin"), getUsersByRole);
router.put("/activate/:id", authMiddleware, requireRole("admin"), activateUser);
router.put("/deactivate/:id", authMiddleware, requireRole("admin"), deactivateUser);
router.delete("/delete/:id", authMiddleware, requireRole("admin"), deleteUser);

export default router;

