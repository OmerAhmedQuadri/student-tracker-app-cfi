import { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { Notification } from "../models/Notification";

export const getMyNotifications = asyncHandler(async (req: Request, res: Response) => {
    const notifications = await Notification.find({ userId: req.user!.id }).sort({ createdAt: -1 });
    res.json(notifications);
});

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
        { _id: id, userId: req.user!.id },
        { read: true },
        { new: true }
    );
    
    if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
    }
    
    res.json(notification);
});

export const createNotification = asyncHandler(async (req: Request, res: Response) => {
    const { userId, type, message } = req.body;
    const notification = await Notification.create({
        userId,
        type,
        message,
        read: false
    });
    res.status(201).json(notification);
});
