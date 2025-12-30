import { Schema, model, Types } from "mongoose";

export interface IMentorshipSession {
  batchId: Types.ObjectId;
  mentorId: Types.ObjectId;
  date: Date;
  topic: string;
  status: "scheduled" | "completed" | "cancelled";
}

const MentorshipSessionSchema = new Schema<IMentorshipSession>({
  batchId: Types.ObjectId,
  mentorId: { type: Schema.Types.ObjectId, ref: "User" },
  date: Date,
  topic: String,
  status: { type: String, enum: ["scheduled", "completed", "cancelled"] },
});

export const MentorshipSession = model<IMentorshipSession>(
  "MentorshipSession",
  MentorshipSessionSchema
);
