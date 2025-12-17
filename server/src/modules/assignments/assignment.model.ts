import mongoose, { Schema, Types } from 'mongoose';

export type AssignmentStatus =
  | 'pending'
  | 'submitted'
  | 'approved'
  | 'rejected'
  | 'late';

export interface IAssignment {
  student: Types.ObjectId;
  createdBy: Types.ObjectId;
  title: string;
  skill?: Types.ObjectId;
  dueDate?: Date;
  status: AssignmentStatus;
  score?: number; // 0-100 (mentor/admin sets this)
  timeSpentMinutes?: number; // student provides
  submittedAt?: Date;
  reviewedAt?: Date;
  notes?: string;
}

const AssignmentSchema = new Schema<IAssignment>(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
    dueDate: { type: Date },
    status: {
      type: String,
      enum: ['pending', 'submitted', 'approved', 'rejected', 'late'],
      default: 'pending',
    },
    score: { type: Number },
    timeSpentMinutes: { type: Number },
    submittedAt: { type: Date },
    reviewedAt: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IAssignment>('Assignment', AssignmentSchema);
