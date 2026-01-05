import { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { StudentProfile } from "../models/StudentProfile";

// add socail media links of the student by the student themselves
export const addSocialMediaLinks = asyncHandler(
  async (req: Request, res: Response) => {
    const { githubUrl, linkedinUrl, mediumUrl } = req.body;

    const studentProfile = await StudentProfile.findOne({ userId: req.user!.id });
    
    if (!studentProfile) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    if (githubUrl) {
      studentProfile.socials = studentProfile.socials || {};
      studentProfile.socials.github = {
        profileUrl: githubUrl,
        lastFetchedAt: new Date(),
      };
    }

    if (linkedinUrl) {
      studentProfile.socials = studentProfile.socials || {};
      studentProfile.socials.linkedin = {
        profileUrl: linkedinUrl,
        lastFetchedAt: new Date(),
      };
    }

    if (mediumUrl) {
      studentProfile.socials = studentProfile.socials || {};
      studentProfile.socials.medium = {
        profileUrl: mediumUrl,
        lastFetchedAt: new Date(),
      };
    }

    await studentProfile.save();

    res.status(200).json({ message: "Social media links updated successfully" });
  }
);
