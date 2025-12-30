import { Schema, model, Types } from "mongoose";

export interface IStudentProfile {
  userId: Types.ObjectId;
  stage: "beginner" | "intermediate" | "advanced";
  socials?: {
    github?: { username: string; lastFetchedAt?: Date };
    linkedin?: { profileUrl: string; lastFetchedAt?: Date };
    medium?: { username: string; lastFetchedAt?: Date };
  };
}

const StudentProfileSchema = new Schema<IStudentProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", unique: true },
    stage: { type: String, enum: ["beginner", "intermediate", "advanced"] },
    socials: {
      github: {
        username: String,
        lastFetchedAt: Date,
      },
      linkedin: {
        profileUrl: String,
        lastFetchedAt: Date,
      },
      medium: {
        username: String,
        lastFetchedAt: Date,
      },
    },
  },
  { timestamps: true }
);

export const StudentProfile = model<IStudentProfile>(
  "StudentProfile",
  StudentProfileSchema
);
