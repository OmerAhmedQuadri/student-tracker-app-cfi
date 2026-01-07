import { Schema, model, Types } from "mongoose";

export interface IStudentProfile {
  userId: Types.ObjectId;
  stage: "beginner" | "intermediate" | "advanced";
  skills: Types.ObjectId[];
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
