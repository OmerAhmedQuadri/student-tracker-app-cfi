import { Schema, model } from "mongoose";

export interface ISkill {
  name: string;
  order: number;
  batchId: string;
}

const SkillSchema = new Schema<ISkill>({
  name: { type: String, required: true },
  order: Number,
  batchId: { type: String, required: true },
});

export const Skill = model<ISkill>("Skill", SkillSchema);
