import { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { ExternalActivity } from "../models/ExternalActivity";
import { BrandingPost } from "../models/BrandingPost";

export const logExternalActivity = asyncHandler(async (req: Request, res: Response) => {
    const { platform, metrics, lastActivityDate } = req.body;
    
    // Check if activity for this platform exists for today? Or just update latest?
    // Let's assume we update the latest record for that platform for the user
    
    let activity = await ExternalActivity.findOne({
        userId: req.user!.id,
        platform
    });

    if (activity) {
        activity.metrics = metrics;
        activity.lastActivityDate = lastActivityDate;
        activity.fetchedAt = new Date();
        await activity.save();
    } else {
        activity = await ExternalActivity.create({
            userId: req.user!.id,
            platform,
            metrics,
            lastActivityDate,
            fetchedAt: new Date()
        });
    }

    res.status(200).json(activity);
});

export const addBrandingPost = asyncHandler(async (req: Request, res: Response) => {
    const { platform, url } = req.body;
    const userId = req.user!.id;

    if (!['linkedin', 'medium'].includes(platform)) {
        return res.status(400).json({ message: "Invalid platform. Must be 'linkedin' or 'medium'." });
    }

    if (!url) {
        return res.status(400).json({ message: "URL is required" });
    }

    // Check for uniqueness
    const existingPost = await BrandingPost.findOne({ url });
    if (existingPost) {
        return res.status(409).json({ message: "This post URL has already been submitted." });
    }

    const post = await BrandingPost.create({
        userId,
        platform,
        url,
        postedAt: new Date()
    });

    // Update ExternalActivity metrics or lastActivityDate
    // First, count total posts for this platform for the user
    // Or just update the last activity date.
    
    // Update or Create ExternalActivity to reflect this 'last activity'
    let activity = await ExternalActivity.findOne({ userId, platform });
    
    if (activity) {
        activity.lastActivityDate = new Date();
        // Assuming metrics has a 'postsCount', we could increment it, but for now just tracking activity
        activity.fetchedAt = new Date();
        await activity.save();
    } else {
         await ExternalActivity.create({
            userId,
            platform,
            metrics: {}, // Consider initializing or updating counts
            lastActivityDate: new Date(),
            fetchedAt: new Date()
        });
    }

    res.status(201).json(post);
});

export const getMyExternalActivities = asyncHandler(async (req: Request, res: Response) => {
    const activities = await ExternalActivity.find({ userId: req.user!.id });
    res.json(activities);
});

export const getUserExternalActivities = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const activities = await ExternalActivity.find({ userId });
    res.json(activities);
});

export const getMyBrandingPosts = asyncHandler(async (req: Request, res: Response) => {
    const posts = await BrandingPost.find({ userId: req.user!.id }).sort({ postedAt: -1 });
    res.json(posts);
});

