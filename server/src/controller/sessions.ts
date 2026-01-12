import { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { MentorshipSession } from "../models/MentorshipSession";
import { LearningSession } from "../models/LearningSession";

// --- Mentorship Sessions ---

export const createMentorshipSession = asyncHandler(async (req: Request, res: Response) => {
    const { batchId, date, topic, platform, meetingLink } = req.body;
    const session = await MentorshipSession.create({
        batchId,
        mentorId: req.user!.id,
        date,
        topic,
        status: "scheduled",
        platform: platform || "Online",
        meetingLink
    });
    res.status(201).json(session);
});

export const getMentorshipSessions = asyncHandler(async (req: Request, res: Response) => {
    const sessions = await MentorshipSession.find().populate("mentorId", "name");
    res.json(sessions);
});

export const updateMentorshipSession = asyncHandler(async (req: Request, res: Response) => {
    const session = await MentorshipSession.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!session) return res.status(404).json({ message: "Session not found" });
    res.json(session);
});

// --- Learning Sessions ---

export const logLearningSession = asyncHandler(async (req: Request, res: Response) => {
    const { date, minutesSpent, tasksCompleted, codeSubmissions } = req.body;
    const learningSession = await LearningSession.create({
        userId: req.user!.id,
        date: date || new Date(),
        minutesSpent,
        tasksCompleted,
        codeSubmissions
    });
    res.status(201).json(learningSession);
});

export const getMyLearningSessions = asyncHandler(async (req: Request, res: Response) => {
    const sessions = await LearningSession.find({ userId: req.user!.id }).sort({ date: -1 });
    res.json(sessions);
});

// Admin/Mentor view of student learning sessions
export const getStudentLearningSessions = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const sessions = await LearningSession.find({ userId }).sort({ date: -1 });
    res.json(sessions);
});
