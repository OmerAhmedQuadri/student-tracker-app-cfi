import { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { User } from "../models/User";

// Get all batches with their students and mentors
export const getAllBatchDetails = asyncHandler(
  async (req: Request, res: Response) => {
    // Get all students with batchId
    const students = await User.find({ 
      batchId: { $exists: true, $ne: null },
      role: "student"
    }).select('-password').sort({ batchId: 1 });

    // Get all mentors (they may have batchIds array)
    const mentors = await User.find({ 
      role: "mentor",
      $or: [
        { batchId: { $exists: true, $ne: null } },
        { batchIds: { $exists: true, $ne: [] } }
      ]
    }).select('-password');

    // Group users by batch
    const batchMap = new Map<string, { students: any[], mentors: any[] }>();

    // Add students to their batches
    students.forEach(student => {
      if (!student.batchId) return;
      
      if (!batchMap.has(student.batchId)) {
        batchMap.set(student.batchId, { students: [], mentors: [] });
      }

      batchMap.get(student.batchId)!.students.push(student);
    });

    // Add mentors to their batches (can be in multiple batches)
    mentors.forEach(mentor => {
      // Get all batches for this mentor
      const mentorBatches = mentor.batchIds && mentor.batchIds.length > 0 
        ? mentor.batchIds 
        : (mentor.batchId ? [mentor.batchId] : []);

      mentorBatches.forEach(batchId => {
        if (!batchMap.has(batchId)) {
          batchMap.set(batchId, { students: [], mentors: [] });
        }
        batchMap.get(batchId)!.mentors.push(mentor);
      });
    });

    // Convert map to array
    const batches = Array.from(batchMap.entries()).map(([batchId, data]) => ({
      batchId,
      studentCount: data.students.length,
      mentorCount: data.mentors.length,
      students: data.students,
      mentors: data.mentors
    }));

    res.json(batches);
  }
);

// Get specific batch details
export const getBatchById = asyncHandler(
  async (req: Request, res: Response) => {
    const { batchId } = req.params;

    // Get students in this batch
    const students = await User.find({ 
      role: "student", 
      batchId 
    }).select('-password');

    // Get mentors in this batch (checking both batchId and batchIds)
    const mentors = await User.find({ 
      role: "mentor",
      $or: [
        { batchId },
        { batchIds: batchId }
      ]
    }).select('-password');

    if (students.length === 0 && mentors.length === 0) {
      return res.status(404).json({ message: "Batch not found" });
    }

    res.json({
      batchId,
      studentCount: students.length,
      mentorCount: mentors.length,
      students,
      mentors
    });
  }
);
