import { Schema, model, Types } from "mongoose";

export interface ILearningSession {
  userId: Types.ObjectId;
  date: Date;
  minutesSpent: number;
  tasksCompleted: number;
  codeSubmissions: number;
}

const LearningSessionSchema = new Schema<ILearningSession>({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  date: { type: Date, index: true },
  minutesSpent: Number,
  tasksCompleted: Number,
  codeSubmissions: Number,
});

export const LearningSession = model<ILearningSession>(
  "LearningSession",
  LearningSessionSchema
);
