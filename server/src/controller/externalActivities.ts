import { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { ExternalActivity } from "../models/ExternalActivity";

export const getMyExternalActivities = asyncHandler(async (req: Request, res: Response) => {
    const activities = await ExternalActivity.find({ userId: req.user!.id })
        .sort({ submittedAt: -1 });
    res.json(activities);
});

export const getUserExternalActivities = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const activities = await ExternalActivity.find({ userId })
        .populate('userId', 'name email')
        .sort({ submittedAt: -1 });
    res.json(activities);
});

export const getAllExternalActivities = asyncHandler(async (req: Request, res: Response) => {
    const activities = await ExternalActivity.find()
        .populate('userId', 'name email')
        .sort({ submittedAt: -1 });
    res.json(activities);
});

export const updateActivityStatus = asyncHandler(async (req: Request, res: Response) => {
    const { activityId } = req.params;
    const { status, points } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status. Must be approved or rejected.' });
    }

    const updateData: any = {
        status,
        reviewedAt: new Date(),
        reviewedBy: req.user!.id
    };
    
    if (points !== undefined) {
        updateData.points = points;
    }

    const activity = await ExternalActivity.findByIdAndUpdate(
        activityId,
        updateData,
        { new: true, runValidators: false }
    ).populate('userId', 'name email');

    if (!activity) {
        return res.status(404).json({ message: 'Activity not found' });
    }

    res.json(activity);
});

export const submitExternalActivity = asyncHandler(async (req: Request, res: Response) => {
    const { title, platform, description, url } = req.body;
    const userId = req.user!.id;

    if (!title || !platform) {
        return res.status(400).json({ message: 'Title and platform are required' });
    }

    const activity = await ExternalActivity.create({
        userId,
        title,
        platform,
        description,
        url,
        status: 'pending',
        submittedAt: new Date()
    });

    const populatedActivity = await ExternalActivity.findById(activity._id).populate('userId', 'name email');
    res.status(201).json(populatedActivity);
});
