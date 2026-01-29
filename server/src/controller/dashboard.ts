import { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { StudentProfile } from "../models/StudentProfile";
import { StudentAssignment } from "../models/StudentAssignment";
import { StudentAttendance } from "../models/StudentAttendance";

// Dashboard for Student
export const getStudentDashboard = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const profile = await StudentProfile.findOne({ userId });

    // Recent assignments
    const recentAssignmentsRaw = await StudentAssignment.find({ userId })
        .sort({ _id: -1 }) // Sort by creation time (approx recent)
        .limit(10)
        .populate("assignmentId");

    const recentAssignments = recentAssignmentsRaw
        .filter((a: any) => a.assignmentId) // Filter out null/invalid assignments
        .slice(0, 5);

    // Check for consecutive absences (last 3 sessions)
    const last3Attendance = await StudentAttendance.find({ userId })
        .sort({ date: -1 })
        .limit(3);

    const consecutiveAbsences = last3Attendance.length >= 3 && last3Attendance.every(a => a.finalStatus === 'absent');

    res.json({
        profile,
        recentAssignments,
        consecutiveAbsences
    });
});

// Dashboard for Admin/Mentor (Overview)
export const getMentorDashboard = asyncHandler(async (req: Request, res: Response) => {
    // 1. Batch-level performance
    // 2. Students falling behind (low streak, missed assignments)

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
