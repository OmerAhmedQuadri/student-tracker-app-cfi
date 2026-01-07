import { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { StudentProfile } from "../models/StudentProfile";
import { StudentAssignment } from "../models/StudentAssignment";
import { StudentSkillProgress } from "../models/StudentSkillProgress";

// Dashboard for Student
export const getStudentDashboard = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const profile = await StudentProfile.findOne({ userId }).populate("skills");
    const skillProgress = await StudentSkillProgress.find({ userId }).populate("skillId");
    
    // Recent assignments
    const recentAssignments = await StudentAssignment.find({ userId })
        .sort({ submittedAt: -1 })
        .limit(5)
        .populate("assignmentId");

    res.json({
        profile,
        skillProgress,
        recentAssignments
    });
});

// Dashboard for Admin/Mentor (Overview)
export const getMentorDashboard = asyncHandler(async (req: Request, res: Response) => {
    // 1. Batch-level performance
    // 2. Students falling behind (low streak, missed assignments)
    // 3. Weak topics (aggregated from StudentSkillProgress low levels)
    
    const students = await StudentProfile.find().populate("userId", "name email");
    
    const atRiskStudents = students.filter(s => s.currentStreak < 2); // Simple rule for demo

    res.json({
        totalStudents: students.length,
        atRiskCount: atRiskStudents.length,
        atRiskStudents
    });
});

// Leaderboard
export const getLeaderboard = asyncHandler(async (req: Request, res: Response) => {
    const leaderboard = await StudentProfile.find()
        .sort({ totalPoints: -1 })
        .limit(10)
        .populate("userId", "name");
        
    res.json(leaderboard);
});
