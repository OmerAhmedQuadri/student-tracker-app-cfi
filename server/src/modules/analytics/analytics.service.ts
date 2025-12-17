import Activity from '../activities/activity.model';
import Assignment from '../assignments/assignment.model';
import Skill from '../skills/skill.model';
import User from '../user/user.model';

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

const startOfWeek = (d: Date) => {
  // Week starts on Monday
  const date = startOfDay(d);
  const day = date.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date;
};

export const getStudentWeeklyActivity = async (userId: string) => {
  const now = new Date();
  const weekStart = startOfWeek(now);

  const activities = await Activity.find({
    user: userId,
    date: { $gte: weekStart, $lte: now },
  });

  const totals = activities.reduce(
    (acc, a) => {
      acc.minutesLearned += a.minutesLearned || 0;
      acc.tasksCompleted += a.tasksCompleted || 0;
      acc.codeSubmissions += a.codeSubmissions || 0;
      return acc;
    },
    { minutesLearned: 0, tasksCompleted: 0, codeSubmissions: 0 }
  );

  return { weekStart, now, ...totals };
};

export const getStudentAssignmentStats = async (userId: string) => {
  const now = new Date();

  const all = await Assignment.find({ student: userId as any });

  const pending = all.filter((a) => a.status === 'pending' || a.status === 'submitted' || a.status === 'late');
  const overdue = all.filter(
    (a) => (a.status === 'pending' || a.status === 'submitted') && a.dueDate && a.dueDate < now
  );

  const scored = all.filter((a) => typeof a.score === 'number');
  const avgScore = scored.length
    ? Math.round(scored.reduce((acc, a) => acc + (a.score || 0), 0) / scored.length)
    : null;

  return {
    total: all.length,
    pending: pending.length,
    overdue: overdue.length,
    avgScore,
  };
};

export const getStudentWeaknesses = async (userId: string) => {
  const [weekly, assignmentStats, user] = await Promise.all([
    getStudentWeeklyActivity(userId),
    getStudentAssignmentStats(userId),
    User.findById(userId),
  ]);

  if (!user) return null;

  // Skill weaknesses based on assignment performance grouped by skill.
  const assignments = await Assignment.find({ student: userId as any, score: { $exists: true, $ne: null } })
    .select('skill score timeSpentMinutes')
    .lean();

  const bySkill = new Map<string, { count: number; scoreSum: number; timeSum: number }>();
  for (const a of assignments) {
    if (!a.skill) continue;
    const key = a.skill.toString();
    const row = bySkill.get(key) || { count: 0, scoreSum: 0, timeSum: 0 };
    row.count += 1;
    row.scoreSum += a.score as number;
    row.timeSum += a.timeSpentMinutes || 0;
    bySkill.set(key, row);
  }

  const weakSkills: Array<{ skillId: string; avgScore: number; avgTimeMinutes: number }> = [];
  for (const [skillId, row] of bySkill.entries()) {
    const avgScore = Math.round(row.scoreSum / row.count);
    const avgTimeMinutes = Math.round(row.timeSum / row.count);
    if (avgScore < 60 || avgTimeMinutes > 240) {
      weakSkills.push({ skillId, avgScore, avgTimeMinutes });
    }
  }

  // Attach skill names
  const skillIds = weakSkills.map((w) => w.skillId);
  const skills = await Skill.find({ _id: { $in: skillIds } }).select('name').lean();
  const nameMap = new Map(skills.map((s) => [s._id.toString(), s.name]));

  const weakSkillsWithNames = weakSkills.map((w) => ({
    ...w,
    skillName: nameMap.get(w.skillId) || 'Unknown',
  }));

  // Behavioral weaknesses
  const lowActivity = weekly.minutesLearned < 60; // simple threshold
  const brokenStreak = (user.streak?.current || 0) === 0;

  return {
    lowActivity,
    brokenStreak,
    overdueAssignments: assignmentStats.overdue,
    weakSkills: weakSkillsWithNames,
  };
};

export const getMentorDashboard = async () => {
  const students = await User.find({ role: 'student' })
    .select('name email streak totalPoints leaderboardScore roadmap')
    .lean();

  const totalStudents = students.length;

  // Engagement: last 7 days total minutes across all students
  const now = new Date();
  const from = new Date(now);
  from.setDate(now.getDate() - 6);

  const activities = await Activity.find({ date: { $gte: startOfDay(from), $lte: now } })
    .select('date minutesLearned user')
    .lean();

  const minutesByDay: Record<string, number> = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(from);
    d.setDate(from.getDate() + i);
    minutesByDay[startOfDay(d).toISOString()] = 0;
  }
  for (const a of activities) {
    const key = startOfDay(new Date(a.date)).toISOString();
    minutesByDay[key] = (minutesByDay[key] || 0) + (a.minutesLearned || 0);
  }

  // Falling behind: streak == 0 OR no roadmap entries OR very low totalPoints
  const fallingBehind = students
    .filter((s) => (s.streak?.current || 0) === 0 || !s.roadmap || s.roadmap.length === 0 || (s.totalPoints || 0) < 10)
    .map((s) => ({ _id: s._id, name: s.name, email: s.email, streak: s.streak?.current || 0, totalPoints: s.totalPoints || 0 }));

  // Common weak skills: based on low avg assignment score across all students
  const assignments = await Assignment.find({ score: { $exists: true, $ne: null }, skill: { $exists: true } })
    .select('skill score')
    .lean();

  const skillAgg = new Map<string, { count: number; sum: number }>();
  for (const a of assignments) {
    if (!a.skill) continue;
    const key = a.skill.toString();
    const row = skillAgg.get(key) || { count: 0, sum: 0 };
    row.count += 1;
    row.sum += a.score as number;
    skillAgg.set(key, row);
  }

  const weakSkillIds = [...skillAgg.entries()]
    .map(([skillId, row]) => ({
      skillId,
      avgScore: Math.round(row.sum / row.count),
      samples: row.count,
    }))
    .filter((x) => x.avgScore < 60)
    .sort((a, b) => a.avgScore - b.avgScore)
    .slice(0, 5);

  const skills = await Skill.find({ _id: { $in: weakSkillIds.map((x) => x.skillId) } }).select('name').lean();
  const nameMap = new Map(skills.map((s) => [s._id.toString(), s.name]));

  const commonWeakSkills = weakSkillIds.map((x) => ({
    ...x,
    skillName: nameMap.get(x.skillId) || 'Unknown',
  }));

  // Common weak topics: topics with lowest completion rate.
  const allSkills = await Skill.find({}).select('name topics').lean();
  const completionBySkillTopic = new Map<string, number>();

  for (const s of students) {
    for (const r of (s as any).roadmap || []) {
      const skillId = r.skill?.toString?.();
      if (!skillId) continue;
      const completed = new Set((r.completedTopics || []) as string[]);
      for (const topicTitle of completed) {
        const key = `${skillId}::${topicTitle}`;
        completionBySkillTopic.set(key, (completionBySkillTopic.get(key) || 0) + 1);
      }
    }
  }

  const commonWeakTopics = allSkills
    .flatMap((sk: any) => {
      const skillId = sk._id.toString();
      return (sk.topics || []).map((t: any) => {
        const completedCount = completionBySkillTopic.get(`${skillId}::${t.title}`) || 0;
        const completionRate = totalStudents ? completedCount / totalStudents : 0;
        return {
          skillId,
          skillName: sk.name,
          topicTitle: t.title,
          completionRate: Math.round(completionRate * 100),
        };
      });
    })
    .sort((a: any, b: any) => a.completionRate - b.completionRate)
    .slice(0, 10);

  return {
    totalStudents,
    fallingBehind,
    commonWeakSkills,
    commonWeakTopics,
    engagementMinutesLast7Days: Object.entries(minutesByDay)
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([day, minutes]) => ({ day, minutes })),
  };
};
