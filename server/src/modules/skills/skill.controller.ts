import { Request, Response } from 'express';
import Skill from './skill.model';
import User from '../user/user.model';
import Activity from '../activities/activity.model';

const getStageFromProgress = (progress: number) => {
  if (progress >= 75) return 'advanced' as const;
  if (progress >= 40) return 'intermediate' as const;
  return 'beginner' as const;
};

export const getSkills = async (req: Request, res: Response) => {
  try {
    const skills = await Skill.find({});
    res.json(skills);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const createSkill = async (req: Request, res: Response) => {
  try {
    const { name, category, topics } = req.body;
    const skill = await Skill.create({ name, category, topics });
    res.status(201).json(skill);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const updateSkill = async (req: Request, res: Response) => {
    try {
        const skill = await Skill.findById(req.params.id);
        if (skill) {
            skill.name = req.body.name || skill.name;
            skill.category = req.body.category || skill.category;
            skill.topics = req.body.topics || skill.topics;
            const updatedSkill = await skill.save();
            res.json(updatedSkill);
        } else {
            res.status(404).json({ message: 'Skill not found' });
        }
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const deleteSkill = async (req: Request, res: Response) => {
    try {
        const skill = await Skill.findById(req.params.id);
        if (skill) {
            await skill.deleteOne();
            res.json({ message: 'Skill removed' });
        } else {
            res.status(404).json({ message: 'Skill not found' });
        }
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

/**
 * Returns topics for a skill with { completed: boolean } for the logged-in student.
 * Used by the frontend to draw the roadmap/graph.
 */
export const getSkillRoadmap = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const skill = await Skill.findById(req.params.id);
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const roadmapEntry = user.roadmap?.find(
      (r) => r.skill.toString() === skill._id.toString()
    );

    const completed = new Set(roadmapEntry?.completedTopics || []);
    const topics = skill.topics.map((t) => ({
      title: t.title,
      description: t.description,
      resources: t.resources,
      completed: completed.has(t.title),
    }));

    return res.json({
      skillId: skill._id,
      skillName: skill.name,
      category: skill.category,
      progress: roadmapEntry?.progress ?? 0,
      stage: roadmapEntry?.stage ?? 'beginner',
      topics,
      covered: topics.filter((t) => t.completed).length,
      pending: topics.filter((t) => !t.completed).length,
    });
  } catch (error) {
    return res.status(500).json({ message: (error as Error).message });
  }
};

/**
 * Marks a topic as completed for the logged-in student.
 * Body: { topicTitle?: string, topicIndex?: number }
 */
export const completeSkillTopic = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const skill = await Skill.findById(req.params.id);
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    const { topicTitle, topicIndex, minutesSpent } = req.body as {
      topicTitle?: string;
      topicIndex?: number;
      minutesSpent?: number;
    };

    let resolvedTitle = topicTitle;
    if (!resolvedTitle && typeof topicIndex === 'number') {
      const topic = skill.topics[topicIndex];
      if (!topic) {
        return res.status(400).json({ message: 'Invalid topicIndex' });
      }
      resolvedTitle = topic.title;
    }

    if (!resolvedTitle) {
      return res
        .status(400)
        .json({ message: 'Provide topicTitle or topicIndex' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.roadmap = user.roadmap || [];
    const existingIndex = user.roadmap.findIndex(
      (r) => r.skill.toString() === skill._id.toString()
    );

    if (existingIndex === -1) {
      user.roadmap.push({
        skill: skill._id,
        progress: 0,
        stage: 'beginner',
        completedTopics: [],
      } as any);
    }

    const entry = user.roadmap.find(
      (r) => r.skill.toString() === skill._id.toString()
    )!;

    entry.completedTopics = entry.completedTopics || [];
    if (!entry.completedTopics.includes(resolvedTitle)) {
      entry.completedTopics.push(resolvedTitle);
    }

    const totalTopics = skill.topics.length || 1;
    entry.progress = Math.round((entry.completedTopics.length / totalTopics) * 100);
    entry.stage = getStageFromProgress(entry.progress);

    await user.save();

    // Optional: store time spent by logging an activity entry
    if (typeof minutesSpent === 'number' && minutesSpent > 0) {
      await Activity.create({
        user: req.user._id,
        date: new Date(),
        minutesLearned: minutesSpent,
        tasksCompleted: 0,
        codeSubmissions: 0,
        type: 'learning',
        description: `Completed topic: ${resolvedTitle}`,
      });
    }

    return res.json({
      message: 'Topic marked as completed',
      skillId: skill._id,
      topicTitle: resolvedTitle,
      progress: entry.progress,
      stage: entry.stage,
      covered: entry.completedTopics.length,
      total: totalTopics,
    });
  } catch (error) {
    return res.status(500).json({ message: (error as Error).message });
  }
};
