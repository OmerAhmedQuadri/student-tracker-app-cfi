import { Schema, model, Types } from "mongoose";

export interface IMentorshipSession {
  batchId: string;
  mentorId: Types.ObjectId;
  date: Date;
  topic: string;
  status: "scheduled" | "completed" | "cancelled";
  platform?: "Online" | "Offline" | "Google Meet" | "Zoom" | "Microsoft Teams";
  meetingLink?: string;
}

const MentorshipSessionSchema = new Schema<IMentorshipSession>({
  batchId: { type: String, required: true },
  mentorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  topic: { type: String, required: true },
  status: { type: String, enum: ["scheduled", "completed", "cancelled"], default: "scheduled" },
  platform: { type: String, enum: ["Online", "Offline", "Google Meet", "Zoom", "Microsoft Teams"], default: "Online" },
  meetingLink: { type: String },
});

export const MentorshipSession = model<IMentorshipSession>(
  "MentorshipSession",
  MentorshipSessionSchema
);
