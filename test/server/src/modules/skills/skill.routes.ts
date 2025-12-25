import { Router } from 'express';
import * as skillController from './skill.controller';
import { protect, admin } from '../auth/auth.middleware';

const router = Router();

router.route('/')
  .get(protect, skillController.getSkills)
  .post(protect, admin, skillController.createSkill);

router.route('/:id')
  .get(protect, skillController.getSkillRoadmap)
  .put(protect, admin, skillController.updateSkill)
  .delete(protect, admin, skillController.deleteSkill);

router.route('/:id/topics/complete')
  .post(protect, skillController.completeSkillTopic);

export default router;
