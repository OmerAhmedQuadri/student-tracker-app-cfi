import { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { User } from "../models/User";
import { StudentAttendance } from "../models/StudentAttendance";
import { MentorshipSession } from "../models/MentorshipSession";

// Get students assigned to mentor's batches
export const getMyBatchStudents = asyncHandler(
  async (req: Request, res: Response) => {
    const mentor = await User.findById(req.user!.id);

    if (!mentor) {
      return res.status(404).json({
        message: "Mentor not found"
      });
    }

    // Get mentor's batches - support both old batchId and new batchIds array
    const mentorBatches = mentor.batchIds && mentor.batchIds.length > 0
      ? mentor.batchIds
      : (mentor.batchId ? [mentor.batchId] : []);

    // If mentor has no batches assigned, return all students (temporary fallback)
    if (mentorBatches.length === 0) {
      const allStudents = await User.find({
        role: "student"
      }).select('-password');

      return res.json(allStudents);
    }

    // Find students in any of the mentor's batches
    const students = await User.find({
      role: "student",
      batchId: { $in: mentorBatches }
    }).select('-password');

    res.json(students);
  }
);

// Get attendance history for mentor's batches
export const getBatchAttendanceHistory = asyncHandler(
  async (req: Request, res: Response) => {
    const mentor = await User.findById(req.user!.id);

    if (!mentor) {
      return res.status(404).json({
        message: "Mentor not found"
      });
    }

    // Get mentor's batches - support both old batchId and new batchIds array
    const mentorBatches = mentor.batchIds && mentor.batchIds.length > 0
      ? mentor.batchIds
      : (mentor.batchId ? [mentor.batchId] : []);

    // If no batches assigned, return all attendance records
    let students;
    if (mentorBatches.length === 0) {
      students = await User.find({ role: "student" });
    } else {
      students = await User.find({
        role: "student",
        batchId: { $in: mentorBatches }
      });
    }

    const studentIds = students.map(s => s._id);

    const attendance = await StudentAttendance.find({
      userId: { $in: studentIds }
    })
      .populate('userId', 'name email batchId')
      .populate('sessionId', 'topic scheduledAt')
      .sort({ date: -1 });

    res.json(attendance);
  }
);

// Get all batches taught by the mentor
export const getMentorBatches = asyncHandler(
  async (req: Request, res: Response) => {
    const mentorId = req.user!.id;
    const mentor = await User.findById(mentorId);

    if (!mentor) {
      return res.status(404).json({
        message: "Mentor not found"
      });
    }

    // Get batches from the mentor's batchIds array (new) or batchId (old)
    let assignedBatches = mentor.batchIds && mentor.batchIds.length > 0
      ? mentor.batchIds
      : (mentor.batchId ? [mentor.batchId] : []);

    // Also get unique batch IDs from mentor's sessions for historical data
    const sessionBatches = await MentorshipSession.find({ mentorId }).distinct('batchId');

    // Combine and deduplicate
    const allBatches = [...new Set([...assignedBatches, ...sessionBatches.map(String)])];

    res.json(allBatches);
  }
);

// Get attendance history filtered by batch
export const getBatchAttendanceByBatch = asyncHandler(
  async (req: Request, res: Response) => {
    const mentorId = req.user!.id;
    const { batchId } = req.query;

    // Get students from the specified batch
    const students = await User.find({
      role: "student",
      batchId: batchId as string
    });

    const studentIds = students.map(s => s._id);

    const attendance = await StudentAttendance.find({
      userId: { $in: studentIds }
    })
      .populate('userId', 'name email batchId')
      .populate('sessionId', 'topic date')
      .sort({ date: -1 });

    res.json(attendance);
  }
);

// Get students by specific batch ID
export const getStudentsByBatch = asyncHandler(
  async (req: Request, res: Response) => {
    const { batchId } = req.params;
    const mentorId = req.user!.id;

    // Verify mentor has access to this batch
    const mentor = await User.findById(mentorId);

    if (!mentor) {
      return res.status(404).json({
        message: "Mentor not found"
      });
    }

    const mentorBatches = mentor.batchIds && mentor.batchIds.length > 0
      ? mentor.batchIds
      : (mentor.batchId ? [mentor.batchId] : []);

    // Check if mentor has access to this batch
    if (mentorBatches.length > 0 && !mentorBatches.includes(batchId as string)) {
      return res.status(403).json({
        message: "You don't have access to this batch"
      });
    }

    // Get students from the specified batch
    const students = await User.find({
      role: "student",
      batchId: batchId
    }).select('-password');

    res.json(students);
  }
);
