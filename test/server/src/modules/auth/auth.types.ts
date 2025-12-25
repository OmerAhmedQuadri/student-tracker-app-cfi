import { Types } from "mongoose";

export interface AuthUser {
  _id: Types.ObjectId;
  role: "student" | "mentor" | "admin";
  email?: string;
}
