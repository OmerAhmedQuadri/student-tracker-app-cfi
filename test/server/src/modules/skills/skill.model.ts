import mongoose, { Document, Schema } from 'mongoose';

export interface ISkill extends Document {
  name: string;
  category: string; // e.g., 'Frontend', 'Backend', 'Language'
  topics: {
    title: string;
    description?: string;
    resources?: string[];
  }[];
}

const SkillSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    topics: [
      {
        title: { type: String, required: true },
        description: { type: String },
        resources: [{ type: String }],
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<ISkill>('Skill', SkillSchema);
