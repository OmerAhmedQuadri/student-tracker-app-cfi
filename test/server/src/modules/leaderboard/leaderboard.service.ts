import Assignment from '../assignments/assignment.model';
import User, { IUser } from '../user/user.model';

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

/**
 * Very simple scoring model (easy to tweak later):
 * - Course completion: avg roadmap/skills progress
 * - Consistency: current streak
 * - Performance: avg assignment score
 * - Branding: github commits + linkedin posts + medium blogs
 */
export const computeLeaderboardScore = async (userId: string) => {
  const user = await User.findById(userId).lean<IUser>();
  if (!user) return 0;

  const progressList = (user.roadmap && user.roadmap.length > 0)
    ? user.roadmap.map((r: any) => r.progress || 0)
    : (user.skillsProgress || []).map((s) => s.progress || 0);

  const courseCompletion = progressList.length
    ? Math.round(progressList.reduce((a, b) => a + b, 0) / progressList.length)
    : 0;

  const streak = clamp(user.streak?.current || 0, 0, 30); // cap at 30
  const consistency = Math.round((streak / 30) * 100);

  const scoredAssignments = await Assignment.find({ student: userId as any, score: { $exists: true, $ne: null } })
    .select('score')
    .lean();
  const performance = scoredAssignments.length
    ? Math.round(
        scoredAssignments.reduce((acc, a) => acc + (a.score as number), 0) / scoredAssignments.length
      )
    : 0;

  const brandingRaw =
    (user.branding?.github?.commitsThisWeek || 0) +
    (user.branding?.linkedin?.postsThisWeek || 0) * 3 +
    (user.branding?.medium?.blogsPublished || 0) * 5;

  const branding = clamp(brandingRaw, 0, 100);

  // weights must sum to 1
  const score =
    courseCompletion * 0.3 +
    consistency * 0.2 +
    performance * 0.3 +
    branding * 0.2;

  return Math.round(score);
};
