import { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { checkAndSendAbsenteeWarning } from "../utils/absenteeMonitor";

export const sendAbsenteeWarning = asyncHandler(async (req: Request, res: Response) => {
    const { studentId } = req.body;

    if (!studentId) {
        return res.status(400).json({ message: "Student ID is required" });
    }

    // Use the shared utility
    // Note: The utility returns false if condition not met OR email failed.
    // Ideally we might want to know specific reason, but for now this simplifies logic.
    const emailSent = await checkAndSendAbsenteeWarning(studentId);

    if (emailSent) {
        res.status(200).json({ message: "Warning email sent successfully" });
    } else {
        // Could be "Not consecutively absent" or "Email failed"
        // For security/privacy in some apps we mimic success, but here let's be informative or generic.
        res.status(200).json({ message: "Process completed. Email sent if conditions were met." });
    }
});
