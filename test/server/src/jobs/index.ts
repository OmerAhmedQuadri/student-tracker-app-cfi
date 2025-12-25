import { initStreakJob } from './streak.job';
import { initReminderJob } from './reminder.job';
import { initLeaderboardJob } from './leaderboard.job';

export const initJobs = () => {
  initStreakJob();
  initReminderJob();
  initLeaderboardJob();
};
