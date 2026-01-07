import { User } from "../models/User";
import { ExternalActivity } from "../models/ExternalActivity";
import { sendEmail } from "../utils/email";
import { StudentProfile } from "../models/StudentProfile";
import { Notification } from "../models/Notification";
import { Assignment } from "../models/Assignment";
import { StudentAssignment } from "../models/StudentAssignment";

// Check for inactive students (No activity > 3 days)
export const checkInactiveStudentsJob = async () => {
    console.log("Checking for inactive students...");
    try {
        const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
        
        // Find profiles where lastStudyDate is older than 3 days or undefined
        // Note: This logic assumes all students have a profile. 
        // Better to iterate users and check their profile.
        
        const students = await User.find({ role: "student", isActive: true });

        for (const student of students) {
             const profile = await StudentProfile.findOne({ userId: student._id });
             
             // If never studied or last study was long ago
             if (!profile || !profile.lastStudyDate || profile.lastStudyDate < threeDaysAgo) {
                 
                 // Avoid spamming? Check if notification already exists for today? 
                 // For now, let's just create one.
                 
                 await Notification.create({
                     userId: student._id,
                     type: "warning",
                     message: "You haven't logged any learning activity in over 3 days! Keep your streak alive!",
                     read: false
                 });
             }
        }
    } catch (error) {
        console.error("Error checking inactive students:", error);
    }
};

// Check for upcoming assignment deadlines
export const checkAssignmentDeadlinesJob = async () => {
    console.log("Checking assignment deadlines...");
    try {
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        
        // Find assignments due between now and tomorrow
        const assignments = await Assignment.find({
            dueDate: {
                $gte: now,
                $lte: tomorrow
            }
        });

        for (const assignment of assignments) {
            // Find students who haven't submitted (or don't have a record)
            const students = await User.find({ role: "student", isActive: true });
            
            for (const student of students) {
                const submission = await StudentAssignment.findOne({
                    userId: student._id,
                    assignmentId: assignment._id,
                    status: "submitted"
                });

                if (!submission) {
                    await Notification.create({
                        userId: student._id,
                        type: "reminder",
                        message: `Reminder: Assignment '${assignment.title}' is due tomorrow!`,
                        read: false
                    });
                }
            }
        }
    } catch (error) {
         console.error("Error checking assignment deadlines:", error);
    }
};

export const checkMissingBrandingPostsJob = async () => {
    console.log("Checking for missing branding posts...");
    
    // Threshold: 14 days (2 weeks)
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    
    const students = await User.find({ role: "student", isActive: true });
    
    // Get admins (to receive emails)
    const admins = await User.find({ role: "admin" });
    const adminEmails = admins.map(a => a.email);
    
    for (const student of students) {
        // Check LinkedIn activity
        const linkedinActivity = await ExternalActivity.findOne({ 
            userId: student._id, 
            platform: "linkedin" 
        });
        
        // check Medium activity
        const mediumActivity = await ExternalActivity.findOne({ 
             userId: student._id, 
             platform: "medium" 
        });
        
        const lastLinkedin = linkedinActivity?.lastActivityDate;
        const lastMedium = mediumActivity?.lastActivityDate;
        
        let alerts = [];
        
        if (!lastLinkedin || lastLinkedin < twoWeeksAgo) {
            alerts.push("LinkedIn");
        }
        
        if (!lastMedium || lastMedium < twoWeeksAgo) {
             alerts.push("Medium");
        }
        
        if (alerts.length > 0) {
            // Send Email
            const subject = `Alert: Missing Branding Activity for ${student.name}`;
            const body = `Student ${student.name} (${student.email}) has missed uploading activity for: ${alerts.join(", ")} for over 2 weeks.`;
            
            if (adminEmails.length > 0) {
                 await sendEmail(adminEmails, subject, body);
            }
        }
    }
};
