import { Schema, model, Types } from "mongoose";

export interface IStudentProfile {
  userId: Types.ObjectId;
  stage: "beginner" | "intermediate" | "advanced";
  skills: Types.ObjectId[];
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
  lastStudyDate?: Date;
  socials?: {
    github?: { profileUrl: string; lastFetchedAt?: Date };
    linkedin?: { profileUrl: string; lastFetchedAt?: Date };
    medium?: { profileUrl: string; lastFetchedAt?: Date };
  };
}

const StudentProfileSchema = new Schema<IStudentProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", unique: true },
    stage: { type: String, enum: ["beginner", "intermediate", "advanced"] },
    skills: [{ type: Schema.Types.ObjectId, ref: "Skill" }],
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    totalPoints: { type: Number, default: 0 },
    lastStudyDate: Date,
    socials: {
      github: {
        profileUrl: String,
        lastFetchedAt: Date,
      },
      linkedin: {
        profileUrl: String,
        lastFetchedAt: Date,  
      },
      medium: {
        profileUrl: String,
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
