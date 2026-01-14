import { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { User } from "../models/User";
import { Batch } from "../models/Batch";

// Create a new batch
export const createBatch = asyncHandler(async (req: Request, res: Response) => {
  const { batchId, description, startDate, endDate, mentorIds } = req.body;

  // Check if batch exists
  const existingBatch = await Batch.findOne({ name: batchId });
  if (existingBatch) {
    res.status(400);
    throw new Error('Batch already exists');
  }

  const batch = await Batch.create({
    name: batchId,
    description,
    startDate,
    endDate
  });

  // If mentors are provided, assign them
  if (mentorIds && mentorIds.length > 0) {
    await User.updateMany(
      { _id: { $in: mentorIds }, role: 'mentor' },
      { $addToSet: { batchIds: batchId } }
    );
  }

  res.status(201).json(batch);
});

// Get all batches with their students and mentors
export const getAllBatchDetails = asyncHandler(
  async (req: Request, res: Response) => {
    // Get all defined batches
    const definedBatches = await Batch.find({});
    const batchMap = new Map<string, { 
      students: any[], 
      mentors: any[], 
      description?: string,
      startDate?: Date, 
      endDate?: Date 
    }>();

    // Initialize map with defined batches
    definedBatches.forEach(batch => {
      // Access direct properties, Mongoose documents behave like objects here
      // But adding 'any' cast to avoid TS issues if not typed fully yet
      const b = batch as any;
      batchMap.set(batch.name, { 
        students: [], 
        mentors: [],
        description: b.description,
        startDate: batch.startDate,
        endDate: batch.endDate
      });
    });

    // Get all students with batchId
    const students = await User.find({ 
      batchId: { $exists: true, $ne: null },
      role: "student"
    }).select('-password').sort({ batchId: 1 });

    // Get all mentors
    const mentors = await User.find({ 
      role: "mentor",
      $or: [
        { batchId: { $exists: true, $ne: null } },
        { batchIds: { $exists: true, $ne: [] } }
      ]
    }).select('-password');

    // Add students to their batches
    students.forEach(student => {
      if (!student.batchId) return;
      
      if (!batchMap.has(student.batchId)) {
        // If batch doesn't exist in Batch model but exists in User (legacy/integrity issue), creating a placeholder
        batchMap.set(student.batchId, { students: [], mentors: [] });
      }

      batchMap.get(student.batchId)!.students.push(student);
    });

    // Add mentors to their batches
    mentors.forEach(mentor => {
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
      mentors: data.mentors,
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate
    }));

    res.json(batches);
  }
);

// Get specific batch details
export const getBatchById = asyncHandler(
  async (req: Request, res: Response) => {
    const { batchId } = req.params;

    const batchFunc: any = await Batch.findOne({ name: batchId });

    // Get students in this batch
    const students = await User.find({ 
      role: "student", 
      batchId 
    }).select('-password');

    // Get mentors in this batch
    const mentors = await User.find({ 
      role: "mentor",
      $or: [
        { batchId },
        { batchIds: batchId }
      ]
    }).select('-password');

    // If strictly checking for existence, we might return 404 if no Batch doc AND no users.
    // But to be consistent with previous behavior, if users exist, we show the batch.
    if (!batchFunc && students.length === 0 && mentors.length === 0) {
      return res.status(404).json({ message: "Batch not found" });
    }

    res.json({
      batchId,
      studentCount: students.length,
      mentorCount: mentors.length,
      students,
      mentors,
      description: batchFunc?.description,
      startDate: batchFunc?.startDate,
      endDate: batchFunc?.endDate
    });
  }
);

// Delete a batch
export const deleteBatch = asyncHandler(
  async (req: Request, res: Response) => {
    const { batchId } = req.params;

    // Find the batch
    const batch = await Batch.findOne({ name: batchId });
    
    if (!batch) {
      res.status(404);
      throw new Error('Batch not found');
    }

    // Check if there are students in this batch
    const studentsCount = await User.countDocuments({ 
      role: "student", 
      batchId 
    });

    if (studentsCount > 0) {
      res.status(400);
      throw new Error(`Cannot delete batch with ${studentsCount} enrolled students. Please reassign students first.`);
    }

    // Remove batch from mentors
    await User.updateMany(
      { role: 'mentor', batchIds: batchId },
      { $pull: { batchIds: batchId } }
    );

    // Also check for legacy single batchId field
    await User.updateMany(
      { role: 'mentor', batchId: batchId },
      { $unset: { batchId: "" } }
    );

    // Delete the batch
    await Batch.deleteOne({ name: batchId });

    res.json({ message: 'Batch deleted successfully' });
  }
);
