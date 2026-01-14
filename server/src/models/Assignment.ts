import { Schema, model, Types } from "mongoose";

export interface IAssignment {
  title: string;
  skillId: Types.ObjectId;
  dueDate: Date;
  maxScore: number;
  batchId: string;
}

const AssignmentSchema = new Schema<IAssignment>({
  title: String,
  skillId: { type: Schema.Types.ObjectId, ref: "Skill" },
  dueDate: Date,
  maxScore: Number,
  batchId: { type: String, required: true, ref: "Batch" },
});

export const Assignment = model<IAssignment>(
  "Assignment",
  AssignmentSchema
);
