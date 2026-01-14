import mongoose, { Document, Schema } from 'mongoose';

export interface IBatch extends Document {
  name: string; // The batch ID string (e.g., "A25")
  description?: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
}

const batchSchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, default: "" },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
}, { timestamps: true });

export const Batch = mongoose.model<IBatch>('Batch', batchSchema);
