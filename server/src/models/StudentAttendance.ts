import { Schema, model, Types } from "mongoose";

export interface IStudentAttendance {
  sessionId: Types.ObjectId;
  userId: Types.ObjectId;
  markedByStudent: boolean;
  approvedByMentor: boolean;
  finalStatus: "present" | "absent";
}

const StudentAttendanceSchema = new Schema<IStudentAttendance>({
  sessionId: { type: Schema.Types.ObjectId, ref: "MentorshipSession" },
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  markedByStudent: Boolean,
  approvedByMentor: Boolean,
  finalStatus: { type: String, enum: ["present", "absent"] },
});

export const StudentAttendance = model<IStudentAttendance>(
  "StudentAttendance",
  StudentAttendanceSchema
);
