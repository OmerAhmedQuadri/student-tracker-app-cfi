import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'student' | 'mentor' | 'admin';
  githubHandle?: string;
  linkedinUrl?: string;
  mediumUrl?: string;
  streak: {
    current: number;
    max: number;
    lastActivityDate: Date | null;
  };
  totalPoints: number;
  leaderboardScore?: number;

  /**
   * Roadmap progress per skill.
   * Used for: topics covered vs pending + stage/progress.
   */
  roadmap?: {
    skill: mongoose.Schema.Types.ObjectId;
    progress: number; // 0-100
    stage: 'beginner' | 'intermediate' | 'advanced';
    completedTopics: string[];
  }[];

  /**
   * Simple “branding” stats (synced from integrations or manually updated).
   */
  branding?: {
    github?: {
      commitsThisWeek?: number;
      projectsPushed?: number;
      lastActivityAt?: Date | null;
    };
    linkedin?: {
      postsThisWeek?: number;
      lastPostAt?: Date | null;
    };
    medium?: {
      blogsPublished?: number;
      lastBlogAt?: Date | null;
    };
  };
  skillsProgress: {
    skillName: string;
    progress: number; // 0-100
    stage: 'beginner' | 'intermediate' | 'advanced';
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: { type: String, enum: ['student', 'mentor', 'admin'], default: 'student' },
    githubHandle: { type: String },
    linkedinUrl: { type: String },
    mediumUrl: { type: String },
    streak: {
      current: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
      lastActivityDate: { type: Date, default: null },
    },
    totalPoints: { type: Number, default: 0 },
    leaderboardScore: { type: Number, default: 0 },

    roadmap: [
      {
        skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
        progress: { type: Number, default: 0 },
        stage: {
          type: String,
          enum: ['beginner', 'intermediate', 'advanced'],
          default: 'beginner',
        },
        completedTopics: [{ type: String }],
      },
    ],

    branding: {
      github: {
        commitsThisWeek: { type: Number, default: 0 },
        projectsPushed: { type: Number, default: 0 },
        lastActivityAt: { type: Date, default: null },
      },
      linkedin: {
        postsThisWeek: { type: Number, default: 0 },
        lastPostAt: { type: Date, default: null },
      },
      medium: {
        blogsPublished: { type: Number, default: 0 },
        lastBlogAt: { type: Date, default: null },
      },
    },
    skillsProgress: [
      {
        skillName: { type: String, required: true },
        progress: { type: Number, default: 0 },
        stage: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);
