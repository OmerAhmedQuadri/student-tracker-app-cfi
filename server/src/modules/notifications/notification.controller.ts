import { Request, Response } from 'express';
import Notification from './notification.model';

export const getNotifications = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
        res.status(401).json({ message: 'User not found' });
        return;
    }
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (notification) {
        notification.isRead = true;
        await notification.save();
        res.json(notification);
    } else {
        res.status(404).json({ message: 'Notification not found' });
    }
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
