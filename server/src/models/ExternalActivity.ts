import { Schema, model, Types } from "mongoose";

export interface IExternalActivity {
  userId: Types.ObjectId;
  title: string;
  platform: string;
  description?: string;
  url?: string;
  points: number;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: Types.ObjectId;
  lastActivityDate?: Date;
}

const ExternalActivitySchema = new Schema<IExternalActivity>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  platform: { type: String, required: true },
  description: { type: String },
  url: { type: String },
  points: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  submittedAt: { type: Date, default: Date.now },
  reviewedAt: { type: Date },
  reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export const ExternalActivity = model<IExternalActivity>(
  "ExternalActivity",
  ExternalActivitySchema
);
