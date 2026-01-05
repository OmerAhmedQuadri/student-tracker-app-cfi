import { Types } from "mongoose";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: Types.ObjectId;
        role: "student" | "mentor" | "admin";
      };
    }
  }
}

export {};
