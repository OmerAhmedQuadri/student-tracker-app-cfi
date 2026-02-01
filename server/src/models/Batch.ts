import mongoose, { Document, Schema } from 'mongoose';

export interface IBatch extends Document {
  name: string; // The batch ID string (e.g., "A25")
  description?: string;
  githubLink?: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
}

const batchSchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, default: "" },
  githubLink: { type: String, default: "" },
  startDate: { type: Date },
  endDate: { type: Date },
}, { timestamps: true });

export const Batch = mongoose.model<IBatch>('Batch', batchSchema);
