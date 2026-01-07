import { Schema, model, Types } from "mongoose";

export interface IBrandingPost {
  userId: Types.ObjectId;
  platform: "linkedin" | "medium";
  url: string;
  postedAt: Date;
}

const BrandingPostSchema = new Schema<IBrandingPost>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    platform: { type: String, enum: ["linkedin", "medium"], required: true },
    url: { type: String, required: true, unique: true },
    postedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const BrandingPost = model<IBrandingPost>("BrandingPost", BrandingPostSchema);
