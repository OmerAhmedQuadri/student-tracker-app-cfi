import { Router } from 'express';
import { protect } from '../modules/auth/auth.middleware';
import * as integrationsController from './integrations.controller';

const router = Router();

router.get('/github/:username', protect, integrationsController.getGithub);
router.get('/medium/:username', protect, integrationsController.getMedium);
router.get('/linkedin/:profileId', protect, integrationsController.getLinkedin);

router.post('/sync', protect, integrationsController.syncMyBranding);

export default router;
