import { Schema, model, Types } from "mongoose";

export interface IAssignment {
  title: string;
  dueDate: Date;
  batchId: string;
}

const AssignmentSchema = new Schema<IAssignment>({
  title: String,
  dueDate: Date,
  batchId: { type: String, required: true, ref: "Batch" },
});

export const Assignment = model<IAssignment>(
  "Assignment",
  AssignmentSchema
);
