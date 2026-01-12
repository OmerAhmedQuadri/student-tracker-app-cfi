import { Schema, model, Types } from "mongoose";

export interface IStudentAttendance {
  sessionId: Types.ObjectId;
  userId: Types.ObjectId;
  markedByStudent: boolean;
  approvedByMentor: boolean;
  finalStatus: "present" | "absent" | "late";
  date?: Date;
}

const StudentAttendanceSchema = new Schema<IStudentAttendance>({
  sessionId: { type: Schema.Types.ObjectId, ref: "MentorshipSession", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  markedByStudent: { type: Boolean, default: false },
  approvedByMentor: { type: Boolean, default: false },
  finalStatus: { type: String, enum: ["present", "absent", "late"], required: true },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

export const StudentAttendance = model<IStudentAttendance>(
  "StudentAttendance",
  StudentAttendanceSchema
);
