import cron from 'node-cron';
import User from '../modules/user/user.model';
import Notification from '../modules/notifications/notification.model';
import { differenceInDays } from '../utils/date.util';

export const initStreakJob = () => {
  // Run every day at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('Running streak check job...');
    const users = await User.find({});
    const today = new Date();

    for (const user of users) {
      const lastActivity = user.streak.lastActivityDate;
      if (!lastActivity) {
        continue;
      }
      const diff = differenceInDays(today, lastActivity);

      if (diff > 1) {
        // Streak broken
        if (user.streak.current > 0) {
            user.streak.current = 0;
            await user.save();
            
            await Notification.create({
                user: user._id,
                message: 'Your learning streak has been reset due to inactivity.',
                type: 'warning'
            });
        }
      } else if (diff === 1) {
          // Reminder to keep streak
          await Notification.create({
              user: user._id,
              message: 'Don\'t forget to log your activity today to keep your streak!',
              type: 'info'
          });
      }
    }
  });
};
