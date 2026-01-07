import { Schema, model } from "mongoose";

export interface ISkill {
  name: string;
  order: number;
}

const SkillSchema = new Schema<ISkill>({
  name: { type: String, required: true },
  order: Number,
});

export const Skill = model<ISkill>("Skill", SkillSchema);
