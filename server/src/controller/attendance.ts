import { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { StudentAttendance } from "../models/StudentAttendance";
import { MentorshipSession } from "../models/MentorshipSession";
import { checkAndSendAbsenteeWarning } from "../utils/absenteeMonitor";

// Mark Attendance (Student)
export const markAttendance = asyncHandler(async (req: Request, res: Response) => {
    const { sessionId } = req.body;

    const session = await MentorshipSession.findById(sessionId);
    if (!session) {
        return res.status(404).json({ message: "Session not found" });
    }

    let attendance = await StudentAttendance.findOne({
        userId: req.user!.id,
        sessionId
    });

    if (attendance) {
        attendance.markedByStudent = true;
        await attendance.save();
    } else {
        attendance = await StudentAttendance.create({
            userId: req.user!.id,
            sessionId,
            markedByStudent: true,
            approvedByMentor: false,
            finalStatus: "absent" // Default untill approved? Or strict? Let's leave undefined or strictly logic later. Schema says enum present/absent.
        });
    }

    res.status(200).json(attendance);
});

// Approve Attendance (Mentor)
export const approveAttendance = asyncHandler(async (req: Request, res: Response) => {
    const { attendanceId } = req.params;
    const { approved, finalStatus } = req.body;

    const attendance = await StudentAttendance.findById(attendanceId);
    if (!attendance) {
        return res.status(404).json({ message: "Attendance record not found" });
    }

    if (approved !== undefined) attendance.approvedByMentor = approved;
    if (finalStatus) attendance.finalStatus = finalStatus;

    await attendance.save();

    // Check and send warning if absent
    if (attendance.finalStatus === 'absent' && attendance.approvedByMentor) {
        // We don't await this to keep response fast, or we can await if critical.
        // Let's not await to avoid blocking response.
        checkAndSendAbsenteeWarning(attendance.userId.toString());
    }

    res.json(attendance);
});

// Mark Attendance by Mentor for Students
export const mentorMarkAttendance = asyncHandler(async (req: Request, res: Response) => {
    const { sessionId, studentId, status } = req.body;

    if (!sessionId || !studentId || !status) {
        return res.status(400).json({ message: "Session ID, Student ID, and status are required" });
    }

    if (!["present", "absent", "late"].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be present, absent, or late" });
    }

    const session = await MentorshipSession.findById(sessionId);
    if (!session) {
        return res.status(404).json({ message: "Session not found" });
    }

    // Check if attendance already exists
    let attendance = await StudentAttendance.findOne({
        userId: studentId,
        sessionId
    });

    if (attendance) {
        // Update existing attendance
        attendance.finalStatus = status;
        attendance.approvedByMentor = true;
        await attendance.save();
    } else {
        // Create new attendance record
        attendance = await StudentAttendance.create({
            userId: studentId,
            sessionId,
            finalStatus: status,
            approvedByMentor: true,
            markedByStudent: false
        });
    }

    res.status(200).json(attendance);

    // Check and send warning if absent
    if (status === 'absent') {
        checkAndSendAbsenteeWarning(studentId);
    }
});

// Get Attendance for a Session (Mentor)
export const getSessionAttendance = asyncHandler(async (req: Request, res: Response) => {
    const { sessionId } = req.params;
    const attendance = await StudentAttendance.find({ sessionId }).populate("userId", "name email batchId");
    res.json(attendance);
});

// Get My Attendance (Student)
export const getMyAttendance = asyncHandler(async (req: Request, res: Response) => {
    const attendance = await StudentAttendance.find({ userId: req.user!.id }).populate("sessionId");
    res.json(attendance);
});
