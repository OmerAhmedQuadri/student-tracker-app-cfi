import {Router} from "express";
import { addSkills, addSocialMediaLinks, getAllStudentsWithSkills, getStudentSkills } from "../controller/students";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";

const router : Router = Router();

router.put('/students/me/socials',authMiddleware, requireRole("student"), addSocialMediaLinks);
router.post('/students/me/skills',authMiddleware, requireRole("student"), addSkills);
router.get('/students/me/skills',authMiddleware, requireRole("student"), getStudentSkills);

export default router;