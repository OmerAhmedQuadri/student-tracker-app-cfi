import { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { Assignment } from "../models/Assignment";
import { StudentAssignment } from "../models/StudentAssignment";
import { User } from "../models/User";

// Create Assignment
export const createAssignment = asyncHandler(async (req: Request, res: Response) => {
  const { title, batchId, tasks } = req.body;

  if (!batchId) {
    return res.status(400).json({ message: "Batch ID is required" });
  }

  // Validate tasks
  if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
    return res.status(400).json({ message: "At least one task is required" });
  }

  const assignment = new Assignment({
    title,
    batchId,
    tasks: tasks.map((task: any) => ({
      title: task.title,
      dueDate: new Date(task.dueDate),
    })),
  });

  await assignment.save();
  res.status(201).json(assignment);
});

// Get All Assignments
export const getAllAssignments = asyncHandler(async (req: Request, res: Response) => {
  const { batchId } = req.query;
  let filter: any = {};

  if (req.user?.role === "student") {
    const user = await User.findById(req.user.id);
    if (!user || !user.batchId) {
      return res.json([]);
    }
    filter.batchId = user.batchId;
  } else if (batchId) {
    filter.batchId = batchId;
  }

  const assignments = await Assignment.find(filter);
  res.json(assignments);
});

// Get Assignment By ID
export const getAssignmentById = asyncHandler(async (req: Request, res: Response) => {
  const assignment = await Assignment.findById(req.params.id);
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

// Submit Assignment Task (Student)
export const submitAssignment = asyncHandler(async (req: Request, res: Response) => {
  const { assignmentId, taskId, timeTakenMinutes, assignmentLink } = req.body;

  // Check if assignment exists
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    return res.status(404).json({ message: "Assignment not found" });
  }

  // Verify task belongs to assignment
  const taskExists = assignment.tasks.some((t) => t._id?.toString() === taskId);
  if (!taskExists) {
    return res.status(400).json({ message: "Task not found in this assignment" });
  }

  let submission = await StudentAssignment.findOne({
    userId: req.user!.id,
    assignmentId,
  });

  if (!submission) {
    submission = new StudentAssignment({
      userId: req.user!.id,
      assignmentId,
      status: "pending",
      taskSubmissions: [],
    });
  }

  // Find if this task was already submitted
  const existingTaskSubmissionIndex = submission.taskSubmissions.findIndex(
    (ts) => ts.taskId.toString() === taskId
  );

  const newTaskSubmission = {
    taskId,
    status: "submitted" as const,
    submittedAt: new Date(),
    timeTakenMinutes,
    assignmentLink,
  };

  if (existingTaskSubmissionIndex > -1) {
    // Update existing
    submission.taskSubmissions[existingTaskSubmissionIndex] = {
      ...submission.taskSubmissions[existingTaskSubmissionIndex],
      ...newTaskSubmission, // Update fields
      submittedAt: new Date(), // Always update submittedAt
    };
  } else {
    // Add new
    submission.taskSubmissions.push(newTaskSubmission);
  }

  // Update overall status
  const totalTasks = assignment.tasks.length;
  const submittedTasks = submission.taskSubmissions.filter(ts => ts.status === 'submitted').length;

  if (submittedTasks === totalTasks) {
    submission.status = "submitted";
  } else if (submittedTasks > 0) {
    submission.status = "partially_submitted";
  } else {
    submission.status = "pending";
  }

  await submission.save();
  res.status(200).json(submission);
});

// Grade Assignment (Mentor)
export const gradeAssignment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, score } = req.body; // Expect status="graded"

  const submission = await StudentAssignment.findById(id);
  if (!submission) {
    return res.status(404).json({ message: "Submission not found" });
  }

  // Update status
  if (status) submission.status = status;
  // if (score !== undefined) submission.score = score; // If we had a score field

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
