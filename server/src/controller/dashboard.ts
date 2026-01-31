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
    const mentorId = req.user!.id;

    // 1. Identify Mentor's Batches
    // We need to know which batches belong to this mentor to filter data
    // Assuming 'User' model has a helper or we check 'batchIds'
    // For now, let's fetch the user to get batchIds
    const { User } = require("../models/User"); // Dynamic import to avoid circular dep if any, or just import top-level
    const mentor = await User.findById(mentorId);

    // Support both new array and old single field
    const mentorBatches = mentor?.batchIds && mentor.batchIds.length > 0
        ? mentor.batchIds
        : (mentor?.batchId ? [mentor.batchId] : []);

    // 2. Stats Counts

    // A. Students Count
    // If no batches assigned, maybe return 0? Or all students? Let's assume 0 for safety or specific logic.
    // The previous logic in mentorStudents.ts showed a temporary fallback to all students if 0 batches.
    // Let's stick to "assigned students" for accuracy.
    const studentCountQuery = mentorBatches.length > 0
        ? { role: "student", batchId: { $in: mentorBatches } }
        : { role: "student" }; // Fallback to all students if no batch assigned? Or better: { role: "student", _id: { $exists: false } } to return 0?
    // Let's stick to the fallback used in 'getMyBatchStudents': return all if no batch assigned (for dev/testing ease)

    const totalStudents = await User.countDocuments(studentCountQuery);

    // B. Assignments Count
    const { Assignment } = require("../models/Assignment");
    const assignmentQuery = mentorBatches.length > 0
        ? { batchId: { $in: mentorBatches } }
        : {};
    const totalAssignments = await Assignment.countDocuments(assignmentQuery);

    // C. Sessions Count
    const { MentorshipSession } = require("../models/MentorshipSession");
    const totalSessions = await MentorshipSession.countDocuments({
        mentorId: mentorId
    });

    // D. Attendance Percentage
    // Average of "present" statuses / total records for mentor's sessions
    const { StudentAttendance } = require("../models/StudentAttendance");
    // Get all session IDs for this mentor
    const mentorSessions = await MentorshipSession.find({ mentorId }).select('_id');
    const mentorSessionIds = mentorSessions.map((s: any) => s._id);

    const totalAttendanceRecords = await StudentAttendance.countDocuments({
        sessionId: { $in: mentorSessionIds }
    });

    const presentAttendanceRecords = await StudentAttendance.countDocuments({
        sessionId: { $in: mentorSessionIds },
        finalStatus: "present"
    });

    const attendancePercentage = totalAttendanceRecords > 0
        ? Math.round((presentAttendanceRecords / totalAttendanceRecords) * 100)
        : 0;

    // 3. Action Items

    // E. Pending Attendance Approvals
    // Count of sessions where 'approvedByMentor' is false but students have marked it? 
    // Or simpler: specific requests. The UI says "Pending Attendance: 3 requests waiting".
    // Usually this means StudentAttendance records where markedByStudent=true, approvedByMentor=false.
    const pendingAttendanceRequests = await StudentAttendance.countDocuments({
        sessionId: { $in: mentorSessionIds },
        markedByStudent: true,
        approvedByMentor: false
    });

    // F. Upcoming Session
    const upcomingSession = await MentorshipSession.findOne({
        mentorId: mentorId,
        date: { $gte: new Date() }, // Future dates
        status: "scheduled"
    })
        .sort({ date: 1 }) // Nearest first
        .select("topics date startTime");

    // G. Ungraded Assignments (New Submissions)
    // Find StudentAssignments for assignments belonging to mentor's batches that are 'submitted'
    const { StudentAssignment } = require("../models/StudentAssignment");

    // First get assignment IDs for mentor's batches
    const mentorAssignments = await Assignment.find(assignmentQuery).select('_id');
    const mentorAssignmentIds = mentorAssignments.map((a: any) => a._id);

    const ungradedSubmissions = await StudentAssignment.countDocuments({
        assignmentId: { $in: mentorAssignmentIds },
        status: "submitted"
    });


    res.json({
        stats: {
            students: totalStudents,
            assignments: totalAssignments,
            sessions: totalSessions,
            attendance: attendancePercentage
        },
        actionItems: {
            pendingAttendance: pendingAttendanceRequests,
            upcomingSession: upcomingSession ? {
                title: upcomingSession.topics[0], // Use first topic as title
                date: upcomingSession.date,
                startTime: upcomingSession.startTime
            } : null,
            ungradedSubmissions: ungradedSubmissions
        }
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
