import { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { Assignment } from "../models/Assignment";
import { StudentAssignment } from "../models/StudentAssignment";

// Create Assignment
export const createAssignment = asyncHandler(async (req: Request, res: Response) => {
  const { title, skillId, dueDate, maxScore, batchId } = req.body;
  
  if (!batchId) {
    return res.status(400).json({ message: "Batch ID is required" });
  }
  
  const assignment = new Assignment({ title, skillId, dueDate, maxScore, batchId });
  await assignment.save();
  res.status(201).json(assignment);
});

// Get All Assignments
export const getAllAssignments = asyncHandler(async (req: Request, res: Response) => {
  const { batchId } = req.query;
  const filter = batchId ? { batchId } : {};
  const assignments = await Assignment.find(filter).populate("skillId");
  res.json(assignments);
});

// Get Assignment By ID
export const getAssignmentById = asyncHandler(async (req: Request, res: Response) => {
  const assignment = await Assignment.findById(req.params.id).populate("skillId");
  if (!assignment) {
    return res.status(404).json({ message: "Assignment not found" });
  }
  res.json(assignment);
});

// Update Assignment
export const updateAssignment = asyncHandler(async (req: Request, res: Response) => {
  const assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!assignment) {
    return res.status(404).json({ message: "Assignment not found" });
  }
  res.json(assignment);
});

// Delete Assignment
export const deleteAssignment = asyncHandler(async (req: Request, res: Response) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) {
    return res.status(404).json({ message: "Assignment not found" });
  }
  await assignment.deleteOne();
  res.json({ message: "Assignment deleted successfully" });
});

// Submit Assignment (Student)
export const submitAssignment = asyncHandler(async (req: Request, res: Response) => {
  const { assignmentId, timeTakenMinutes } = req.body;
  
  // Check if assignment exists
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
  }

  let submission = await StudentAssignment.findOne({
    userId: req.user!.id,
    assignmentId,
  });

  if (submission) {
     submission.submittedAt = new Date();
     submission.status = "submitted";
     submission.timeTakenMinutes = timeTakenMinutes;
     await submission.save();
  } else {
    submission = await StudentAssignment.create({
      userId: req.user!.id,
      assignmentId,
      status: "submitted",
      submittedAt: new Date(),
      timeTakenMinutes
    });
  }
  res.status(200).json(submission);
});

// Grade Assignment (Mentor)
export const gradeAssignment = asyncHandler(async (req: Request, res: Response) => {
  const { studentAssignmentId } = req.params; // ID of the StudentAssignment document
  const { score } = req.body;

  const submission = await StudentAssignment.findById(studentAssignmentId);
  if (!submission) {
    return res.status(404).json({ message: "Submission not found" });
  }

  submission.score = score;
  await submission.save();

  res.json(submission);
});

// Get My Assignments (Student)
export const getMyAssignments = asyncHandler(async (req: Request, res: Response) => {
    const submissions = await StudentAssignment.find({ userId: req.user!.id }).populate("assignmentId");
    res.json(submissions);
});

// Get Submissions for an Assignment (Mentor)
export const getSubmissionsForAssignment = asyncHandler(async (req: Request, res: Response) => {
    const { assignmentId } = req.params;
    const submissions = await StudentAssignment.find({ assignmentId })
        .populate("userId", "name email")
        .sort({ submittedAt: -1 });
    res.json(submissions);
});
