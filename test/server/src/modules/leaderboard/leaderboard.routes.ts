import { Router } from 'express';
import * as leaderboardController from './leaderboard.controller';
import { protect } from '../auth/auth.middleware';

const router = Router();

router.route('/')
  .get(protect, leaderboardController.getLeaderboard);

export default router;
