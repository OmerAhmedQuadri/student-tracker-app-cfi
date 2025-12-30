import { Schema, model, Types } from "mongoose";

export interface IUser {
  name: string;
  email: string;
  role: "student" | "mentor" | "admin";
  batchId?: Types.ObjectId;
  isActive: boolean;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ["student", "mentor", "admin"], required: true, default: "student" },
    batchId: { type: Schema.Types.ObjectId, ref: "Batch" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const User = model<IUser>("User", UserSchema);
