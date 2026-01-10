import { Schema, model, Types } from "mongoose";

export interface ILearningSession {
  userId: Types.ObjectId;
  date: Date;
  minutesSpent: number;
  tasksCompleted: string[];
  codeSubmissions: string[];
}

const LearningSessionSchema = new Schema<ILearningSession>({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  date: { type: Date, index: true },
  minutesSpent: Number,
  tasksCompleted: [String],
  codeSubmissions: [String],
});

export const LearningSession = model<ILearningSession>(
  "LearningSession",
  LearningSessionSchema
);
