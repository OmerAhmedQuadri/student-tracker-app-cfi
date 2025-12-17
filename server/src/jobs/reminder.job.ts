import cron from 'node-cron';
import Notification from '../modules/notifications/notification.model';
import Assignment from '../modules/assignments/assignment.model';
import User from '../modules/user/user.model';

const daysAgo = (n: number) => {
	const d = new Date();
	d.setDate(d.getDate() - n);
	return d;
};

/**
 * Simple reminders job.
 * Runs weekly and sends actionable notifications.
 */
export const initReminderJob = () => {
	// Every Monday 09:00
	cron.schedule('0 9 * * 1', async () => {
		console.log('Running reminders job...');

		const students = await User.find({ role: 'student' }).select('_id branding roadmap skillsProgress').lean();

		// Compute average JavaScript progress (if available)
		const jsProgresses = students
			.map((s: any) => {
				const bySkillsProgress = (s.skillsProgress || []).find((x: any) => (x.skillName || '').toLowerCase() === 'javascript');
				if (bySkillsProgress) return bySkillsProgress.progress || 0;

				return null;
			})
			.filter((x: any) => typeof x === 'number');

		const avgJs = jsProgresses.length
			? jsProgresses.reduce((a: number, b: number) => a + b, 0) / jsProgresses.length
			: null;

		for (const student of students) {
			const createOncePerWeek = async (message: string, type: 'info' | 'warning' | 'alert') => {
				const since = daysAgo(7);
				const exists = await Notification.exists({
					user: student._id,
					message,
					createdAt: { $gte: since },
				});
				if (!exists) {
					await Notification.create({ user: student._id, message, type });
				}
			};

			// 1) LinkedIn inactivity
			const lastPost = student.branding?.linkedin?.lastPostAt ? new Date(student.branding.linkedin.lastPostAt) : null;
			if (lastPost && lastPost < daysAgo(7)) {
				await createOncePerWeek("You haven’t posted on LinkedIn this week.", 'info');
			}

			// 2) Missed assignments
			const missedCount = await Assignment.countDocuments({
				student: student._id.toString(),
				status: { $in: ['pending', 'submitted'] },
				dueDate: { $lt: new Date() },
			});
			if (missedCount >= 2) {
				await createOncePerWeek(`You missed ${missedCount} assignments.`, 'warning');
			}

			// 3) Below-average JavaScript progress (only if we have data)
			if (avgJs !== null) {
				const js = (student.skillsProgress || []).find((x: any) => (x.skillName || '').toLowerCase() === 'javascript');
				if (js && typeof js.progress === 'number' && js.progress < avgJs) {
					await createOncePerWeek('Your JavaScript progress is below average.', 'alert');
				}
			}
		}
	});
};

