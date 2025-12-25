import User from '../modules/user/user.model';
import { isSameDay, differenceInDays } from './date.util';

export const updateStreak = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) return;

  const today = new Date();
  const lastActivity = user.streak.lastActivityDate;

  // First ever activity
  if (!lastActivity) {
    user.streak.current = 1;
    user.streak.max = Math.max(user.streak.max || 0, 1);
    user.streak.lastActivityDate = today;
    await user.save();
    return;
  }

  if (isSameDay(today, lastActivity)) {
    // Already updated for today
    return;
  }

  const diff = differenceInDays(today, lastActivity);

  if (diff === 1) {
    // Consecutive day
    user.streak.current += 1;
  } else if (diff > 1) {
    // Streak broken
    user.streak.current = 1;
  } else {
      // Should not happen if isSameDay check works, but just in case
      // If diff is 0, it's same day.
      // If diff < 0, something is wrong with dates (timezones?), assume same day or ignore.
  }

  if (user.streak.current > user.streak.max) {
    user.streak.max = user.streak.current;
  }

  user.streak.lastActivityDate = today;
  await user.save();
};
