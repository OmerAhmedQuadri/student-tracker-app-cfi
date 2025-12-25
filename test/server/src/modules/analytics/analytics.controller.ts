import type { Request, Response } from 'express';
import User from '../user/user.model';
import {
  getMentorDashboard,
  getStudentAssignmentStats,
  getStudentWeaknesses,
  getStudentWeeklyActivity,
} from './analytics.service';

/**
 * Student analytics summary: weekly activity + streak + assignment stats.
 */
export const getMySummary = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });

    const [weekly, assignmentStats, user] = await Promise.all([
      getStudentWeeklyActivity(req.user._id.toString()),
      getStudentAssignmentStats(req.user._id.toString()),
      User.findById(req.user._id).select('streak totalPoints leaderboardScore').lean(),
    ]);

    return res.json({
      weekly,
      assignments: assignmentStats,
      streak: user?.streak || { current: 0, max: 0, lastActivityDate: null },
      totalPoints: user?.totalPoints || 0,
      leaderboardScore: user?.leaderboardScore || 0,
    });
  } catch (error) {
    return res.status(500).json({ message: (error as Error).message });
  }
};

/**
 * Student weaknesses: low activity, broken streak, overdue assignments, weak skills.
 */
export const getMyWeaknesses = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });

    const weaknesses = await getStudentWeaknesses(req.user._id.toString());
    if (!weaknesses) return res.status(404).json({ message: 'User not found' });

    return res.json(weaknesses);
  } catch (error) {
    return res.status(500).json({ message: (error as Error).message });
  }
};

/**
 * Mentor/Admin dashboard: batch overview.
 */
export const getDashboard = async (req: Request, res: Response) => {
  try {
    const data = await getMentorDashboard();
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ message: (error as Error).message });
  }
};
