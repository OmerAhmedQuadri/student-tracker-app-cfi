import { Schema, model, Types } from "mongoose";

export type SkillCategory =
  | "Frontend"
  | "Backend"
  | "Language"
  | "DevOps"
  | "Database";

export interface ISkill {
  _id: Types.ObjectId;
  name: string;
  category: SkillCategory;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const SkillSchema = new Schema<ISkill>(
  {
    name: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    order: { type: Number, required: true }
  },
  { timestamps: true }
);

export const Skill = model<ISkill>("Skill", SkillSchema);
