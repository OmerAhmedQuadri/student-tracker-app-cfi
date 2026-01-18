import { Schema, model, Types } from "mongoose";

export interface IMentorshipSession {
  batchId: string;
  mentorId: Types.ObjectId;
  date: Date;
  startTime: string;
  endTime: string;
  topics: string[];
  status: "scheduled" | "completed" | "cancelled";
  platform?: "Online" | "Offline" | "Google Meet" | "Zoom" | "Microsoft Teams";
  meetingLink?: string;
}

const MentorshipSessionSchema = new Schema<IMentorshipSession>({
  batchId: { type: String, required: true },
  mentorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  topics: { type: [String], required: true, validate: [(val: string[]) => val.length > 0, 'At least one topic is required'] },
  status: { type: String, enum: ["scheduled", "completed", "cancelled"], default: "scheduled" },
  platform: { type: String, enum: ["Online", "Offline", "Google Meet", "Zoom", "Microsoft Teams"], default: "Offline" },
  meetingLink: { type: String },
});

export const MentorshipSession = model<IMentorshipSession>(
  "MentorshipSession",
  MentorshipSessionSchema
);
