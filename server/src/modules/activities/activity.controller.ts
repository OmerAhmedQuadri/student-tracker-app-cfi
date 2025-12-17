import { Request, Response } from 'express';
import Activity from './activity.model';
import User from '../user/user.model';
import { updateStreak } from '../../utils/streak.util';

export const logActivity = async (req: Request, res: Response) => {
  try {
    const { minutesLearned, tasksCompleted, codeSubmissions, type, description } = req.body;
    
    if (!req.user) {
        res.status(401).json({ message: 'User not found' });
        return;
    }

    const activity = await Activity.create({
      user: req.user._id,
      minutesLearned,
      tasksCompleted,
      codeSubmissions,
      type,
      description,
      date: new Date(),
    });

    // Simple points system (kept intentionally small + predictable)
    const points =
      Math.floor((Number(minutesLearned) || 0) / 10) +
      (Number(tasksCompleted) || 0) * 5 +
      (Number(codeSubmissions) || 0) * 5;

    if (points > 0) {
      await User.updateOne({ _id: req.user._id }, { $inc: { totalPoints: points } });
    }

    // Update User Streak
    await updateStreak(req.user._id.toString());

    res.status(201).json(activity);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getActivities = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
        res.status(401).json({ message: 'User not found' });
        return;
    }
    const activities = await Activity.find({ user: req.user._id }).sort({ date: -1 });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
