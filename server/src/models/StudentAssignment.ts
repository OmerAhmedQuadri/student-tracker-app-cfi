import { Schema, model, Types } from "mongoose";

export interface IStudentAssignment {
  userId: Types.ObjectId;
  assignmentId: Types.ObjectId;
  status: "pending" | "submitted" | "missed" | "partially_submitted" | "graded";
  score?: number;
  // submittedAt: Date; // Deprecated or overall last submission
  // timeTakenMinutes: number;
  // assignmentLink: string;
  taskSubmissions: {
    taskId: Types.ObjectId;
    status: "pending" | "submitted";
    submittedAt: Date;
    timeTakenMinutes: number;
    assignmentLink: string;
  }[];
}

const StudentAssignmentSchema = new Schema<IStudentAssignment>({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  assignmentId: { type: Schema.Types.ObjectId, ref: "Assignment" },
  status: { type: String, enum: ["pending", "submitted", "missed", "partially_submitted", "graded"], default: "pending" },
  score: { type: Number },
  taskSubmissions: [{
    taskId: { type: Schema.Types.ObjectId },
    status: { type: String, enum: ["pending", "submitted"], default: "pending" },
    submittedAt: Date,
    timeTakenMinutes: Number,
    assignmentLink: String,
  }],
});

export const StudentAssignment = model<IStudentAssignment>(
  "StudentAssignment",
  StudentAssignmentSchema
);
