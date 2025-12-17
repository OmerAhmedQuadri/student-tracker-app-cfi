// src/modules/activity/activity.interface.ts
import { Types } from "mongoose";

export interface IActivity {
  user: Types.ObjectId;
  date: Date;
  minutesLearned: number;
  tasksCompleted: number;
  codeSubmissions: number;
  type: "learning" | "coding" | "assignment" | "other";
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
