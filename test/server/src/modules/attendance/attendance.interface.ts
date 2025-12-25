// src/modules/attendance/attendance.interface.ts
import { Types } from "mongoose";

export interface IAttendance {
  user: Types.ObjectId;
  date: Date;
  status: "present" | "absent" | "cancelled" | "pending";
  approvedBy?: Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
