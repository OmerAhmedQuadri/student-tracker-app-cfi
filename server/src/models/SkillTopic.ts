import { Schema, model, Types } from "mongoose";

export interface ISkillTopic {
  skillId: Types.ObjectId;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  estimatedMinutes: number;
}

const SkillTopicSchema = new Schema<ISkillTopic>({
  skillId: { type: Schema.Types.ObjectId, ref: "Skill" },
  title: String,
  difficulty: { type: String, enum: ["easy", "medium", "hard"] },
  estimatedMinutes: Number,
});

export const SkillTopic = model<ISkillTopic>(
  "SkillTopic",
  SkillTopicSchema
);
