import { Schema, model, Types } from "mongoose";

export interface IStudentSkillProgress {
  userId: Types.ObjectId;
  skillId: Types.ObjectId;
  completedTopics: Types.ObjectId[];
  currentLevel: "low" | "average" | "strong";
  lastActivityAt?: Date;
}

const StudentSkillProgressSchema = new Schema<IStudentSkillProgress>({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  skillId: { type: Schema.Types.ObjectId, ref: "Skill" },
  completedTopics: [{ type: Schema.Types.ObjectId, ref: "SkillTopic" }],
  currentLevel: { type: String, enum: ["low", "average", "strong"] },
  lastActivityAt: Date,
});

export const StudentSkillProgress = model<IStudentSkillProgress>(
  "StudentSkillProgress",
  StudentSkillProgressSchema
);
