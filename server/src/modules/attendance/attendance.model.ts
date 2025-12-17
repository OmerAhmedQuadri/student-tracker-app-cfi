// src/modules/attendance/attendance.model.ts
import { Schema, model } from "mongoose";
import { IAttendance } from "./attendance.interface";

const AttendanceSchema = new Schema<IAttendance>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["present", "absent", "cancelled", "pending"],
      default: "pending",
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

export default model<IAttendance>("Attendance", AttendanceSchema);
