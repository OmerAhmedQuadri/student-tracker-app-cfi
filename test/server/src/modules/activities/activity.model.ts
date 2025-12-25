// src/modules/activity/activity.model.ts
import { Schema, model, Types } from "mongoose";
import { IActivity } from "./activity.interface";

const ActivitySchema = new Schema<IActivity>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    minutesLearned: {
      type: Number,
      default: 0,
    },
    tasksCompleted: {
      type: Number,
      default: 0,
    },
    codeSubmissions: {
      type: Number,
      default: 0,
    },
    type: {
      type: String,
      enum: ["learning", "coding", "assignment", "other"],
      default: "learning",
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

export default model<IActivity>("Activity", ActivitySchema);
