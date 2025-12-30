import { Schema, model, Types } from "mongoose";

export interface IStudentAssignment {
  userId: Types.ObjectId;
  assignmentId: Types.ObjectId;
  status: "pending" | "submitted" | "missed";
  score?: number;
  submittedAt?: Date;
  timeTakenMinutes?: number;
}

const StudentAssignmentSchema = new Schema<IStudentAssignment>({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  assignmentId: { type: Schema.Types.ObjectId, ref: "Assignment" },
  status: { type: String, enum: ["pending", "submitted", "missed"] },
  score: Number,
  submittedAt: Date,
  timeTakenMinutes: Number,
});

export const StudentAssignment = model<IStudentAssignment>(
  "StudentAssignment",
  StudentAssignmentSchema
);
