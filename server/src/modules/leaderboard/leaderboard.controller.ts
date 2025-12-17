import { Request, Response } from 'express';
import User from '../user/user.model';

export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    // Simple weighted score (stored daily by a cron job).
    const users = await User.find({ role: 'student' })
      .sort({ leaderboardScore: -1, totalPoints: -1 })
      .limit(10)
      .select('name totalPoints leaderboardScore streak roadmap skillsProgress branding');

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
