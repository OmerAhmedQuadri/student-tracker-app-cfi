import { StudentProfile } from "../models/StudentProfile";
import { StudentAssignment } from "../models/StudentAssignment";
import { LearningSession } from "../models/LearningSession";
import { User } from "../models/User";

//  recurring job to update leaderboards
export const updateLeaderboardJob = async () => {
    console.log("Updating leaderboards...");
    
    try {
        const students = await User.find({ role: "student", isActive: true });
        
        for (const student of students) {
            let totalPoints = 0;

            // 1. Points from Assignments
            // e.g. Sum of scores from submitted assignments
            const assignments = await StudentAssignment.find({ 
                userId: student._id, 
                status: "submitted" 
            });
            
            const assignmentPoints = assignments.reduce((sum, item) => sum + (item.score || 0), 0);
            totalPoints += assignmentPoints;

            // 2. Points from Learning Sessions
            // e.g. 1 point for every 10 minutes spent
            const sessions = await LearningSession.find({ userId: student._id });
            const minutesLogged = sessions.reduce((sum, session) => sum + session.minutesSpent, 0);
            const learningPoints = Math.floor(minutesLogged / 10);
            totalPoints += learningPoints;

            // 3. Points from Streak
            // e.g. 10 points * current streak
            const profile = await StudentProfile.findOne({ userId: student._id });
            let streakPoints = 0;
            if (profile) {
                streakPoints = (profile.currentStreak || 0) * 10;
            }
            totalPoints += streakPoints;

            // Update Profile
            if (profile) {
                profile.totalPoints = totalPoints;
                await profile.save();
            } else {
                 // Should ideally exist, but if not create one?
                 await StudentProfile.create({
                     userId: student._id,
                     stage: 'beginner',
                     totalPoints: totalPoints
                 });
            }
        }
        console.log("Leaderboard updated successfully.");
    } catch (error) {
        console.error("Error updating leaderboard:", error);
    }
};
