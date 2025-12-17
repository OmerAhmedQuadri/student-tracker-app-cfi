import cron from 'node-cron';
import User from '../modules/user/user.model';
import { computeLeaderboardScore } from '../modules/leaderboard/leaderboard.service';

/**
 * Recomputes leaderboardScore daily.
 * Keeps runtime fast for the /leaderboard endpoint.
 */
export const initLeaderboardJob = () => {
	cron.schedule('10 0 * * *', async () => {
		console.log('Running leaderboard job...');

		const students = await User.find({ role: 'student' }).select('_id').lean();
		for (const s of students) {
			const score = await computeLeaderboardScore(s._id.toString());
			await User.updateOne({ _id: s._id }, { $set: { leaderboardScore: score } });
		}
	});
};

