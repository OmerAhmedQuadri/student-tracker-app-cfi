import { Schema, model, Types } from "mongoose";

export interface IAssignment {
  title: string;
  // dueDate: Date; // Optional now?
  batchId: string;
  tasks: {
    _id?: Types.ObjectId;
    title: string;
    dueDate: Date;
    url?: string;
  }[];
}

const AssignmentSchema = new Schema<IAssignment>({
  title: String,
  // dueDate: Date, // Deprecated in favor of task-level due dates, or kept as overall deadline? Keeping for backward compat or overall
  batchId: { type: String, required: true, ref: "Batch" },
  tasks: [{
    title: { type: String, required: true },
    dueDate: { type: Date, required: true },
    url: { type: String },
  }],
});

export const Assignment = model<IAssignment>(
  "Assignment",
  AssignmentSchema
);
