import {Router} from "express";
import { addSocialMediaLinks } from "../controller/students";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";

const router = Router();

router.put('/students/me/socials',authMiddleware, requireRole("student"), addSocialMediaLinks);

export default router;