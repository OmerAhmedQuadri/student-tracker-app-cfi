import { Schema, model, Types } from "mongoose";

export interface INotification {
  userId: Types.ObjectId;
  type: "warning" | "reminder" | "achievement";
  message: string;
  read: boolean;
}

const NotificationSchema = new Schema<INotification>({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  type: { type: String, enum: ["warning", "reminder", "achievement"] },
  message: String,
  read: { type: Boolean, default: false },
});

export const Notification = model<INotification>(
  "Notification",
  NotificationSchema
);
