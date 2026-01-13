import { Schema, model, Types } from "mongoose";

export interface IUser {
  name: string;
  email: string;
  password?: string;
  role: "student" | "mentor" | "admin";
  batchId?: string; // For students - single batch
  batchIds?: string[]; // For mentors - multiple batches
  status: "pending" | "active" | "suspended";
  isActive: boolean;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: { type: String, enum: ["student", "mentor", "admin"], required: true, default: "student" },
    batchId: { type: String }, // For students
    batchIds: [{ type: String }], // For mentors - array of batches
    status: { type: String, enum: ["pending", "active", "suspended"], default: "pending" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const User = model<IUser>("User", UserSchema);
