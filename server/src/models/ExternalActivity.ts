import { Schema, model, Types } from "mongoose";

export interface IExternalActivity {
  userId: Types.ObjectId;
  platform: "github" | "linkedin" | "medium";
  metrics: Record<string, number>;
  lastActivityDate?: Date;
  fetchedAt: Date;
}

const ExternalActivitySchema = new Schema<IExternalActivity>({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  platform: { type: String, enum: ["github", "linkedin", "medium"] },
  metrics: Schema.Types.Mixed,
  lastActivityDate: Date,
  fetchedAt: { type: Date, default: Date.now },
});

export const ExternalActivity = model<IExternalActivity>(
  "ExternalActivity",
  ExternalActivitySchema
);
