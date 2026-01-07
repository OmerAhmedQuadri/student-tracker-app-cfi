import { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { Skill } from "../models/Skills";
import { SkillTopic } from "../models/SkillTopic";
import { StudentSkillProgress } from "../models/StudentSkillProgress";

// --- Skills (Global or per student handled elsewhere, but let's provide get) ---

export const getAllSkills = asyncHandler(async (req: Request, res: Response) => {
    const skills = await Skill.find().sort({ order: 1 });
    res.json(skills);
});

// --- Skill Topics ---

export const createSkillTopic = asyncHandler(async (req: Request, res: Response) => {
    const { skillId, title, difficulty, estimatedMinutes } = req.body;
    
    // Check if skill exists
    const skill = await Skill.findById(skillId);
    if (!skill) {
        return res.status(404).json({ message: "Skill not found" });
    }

    const topic = await SkillTopic.create({
        skillId,
        title,
        difficulty,
        estimatedMinutes
    });

    res.status(201).json(topic);
});

export const getSkillTopics = asyncHandler(async (req: Request, res: Response) => {
    const { skillId } = req.params;
    const topics = await SkillTopic.find({ skillId });
    res.json(topics);
});

export const updateSkillTopic = asyncHandler(async (req: Request, res: Response) => {
    const topic = await SkillTopic.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!topic) return res.status(404).json({ message: "Topic not found" });
    res.json(topic);
});

export const deleteSkillTopic = asyncHandler(async (req: Request, res: Response) => {
    const topic = await SkillTopic.findById(req.params.id);
    if (!topic) return res.status(404).json({ message: "Topic not found" });
    await topic.deleteOne();
    res.json({ message: "Topic deleted successfully" });
});

// --- Student Skill Progress ---

export const updateSkillProgress = asyncHandler(async (req: Request, res: Response) => {
    const { skillId, completedTopicId, currentLevel } = req.body;
    const userId = req.user!.id;

    let progress = await StudentSkillProgress.findOne({ userId, skillId });

    if (!progress) {
        progress = new StudentSkillProgress({
            userId,
            skillId,
            completedTopics: [],
            currentLevel: "low",
            lastActivityAt: new Date()
        });
    }

    if (completedTopicId && !progress.completedTopics.includes(completedTopicId)) {
        progress.completedTopics.push(completedTopicId);
    }
    
    if (currentLevel) {
        progress.currentLevel = currentLevel;
    }

    progress.lastActivityAt = new Date();
    await progress.save();

    res.json(progress);
});

export const getMySkillProgress = asyncHandler(async (req: Request, res: Response) => {
    const progress = await StudentSkillProgress.find({ userId: req.user!.id }).populate("skillId");
    res.json(progress);
});

export const getStudentSkillProgress = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const progress = await StudentSkillProgress.find({ userId }).populate("skillId");
    res.json(progress);
});
