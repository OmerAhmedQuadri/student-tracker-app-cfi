import { Types } from "mongoose";

export interface INotification {
  user: Types.ObjectId;
  message: string;
  type: "info" | "warning" | "alert";
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}
