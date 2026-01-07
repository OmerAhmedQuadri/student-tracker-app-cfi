import { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { StudentAttendance } from "../models/StudentAttendance";
import { MentorshipSession } from "../models/MentorshipSession";

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
    res.json(attendance);
});

// Get Attendance for a Session (Mentor)
export const getSessionAttendance = asyncHandler(async (req: Request, res: Response) => {
    const { sessionId } = req.params;
    const attendance = await StudentAttendance.find({ sessionId }).populate("userId", "name email");
    res.json(attendance);
});

// Get My Attendance (Student)
export const getMyAttendance = asyncHandler(async (req: Request, res: Response) => {
    const attendance = await StudentAttendance.find({ userId: req.user!.id }).populate("sessionId");
    res.json(attendance);
});
