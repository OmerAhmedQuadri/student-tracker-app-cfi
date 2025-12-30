import { Schema, model, Types } from "mongoose";

export interface IAssignment {
  title: string;
  skillId: Types.ObjectId;
  dueDate: Date;
  maxScore: number;
}

const AssignmentSchema = new Schema<IAssignment>({
  title: String,
  skillId: { type: Schema.Types.ObjectId, ref: "Skill" },
  dueDate: Date,
  maxScore: Number,
});

export const Assignment = model<IAssignment>(
  "Assignment",
  AssignmentSchema
);
