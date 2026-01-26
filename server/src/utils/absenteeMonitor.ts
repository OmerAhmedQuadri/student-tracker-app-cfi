import { User } from "../models/User";
import { StudentAttendance } from "../models/StudentAttendance";
import { sendEmail } from "./email";

export const checkAndSendAbsenteeWarning = async (studentId: string): Promise<boolean> => {
    try {
        const student = await User.findById(studentId);
        if (!student) {
           // console.error(`Student not found for absentee check: ${studentId}`);
            return false;
        }

        // Check for consecutive absences (last 3 sessions)
        const last3Attendance = await StudentAttendance.find({ userId: studentId })
            .sort({ date: -1 })
            .limit(3);

        const isConsecutivelyAbsent = last3Attendance.length >= 3 && last3Attendance.every(a => a.finalStatus === 'absent');
        // console.log(`[ABSENTEE DEBUG] Check for student ${student.name} (${studentId}): Last 3 records found=${last3Attendance.length}. All absent? ${isConsecutivelyAbsent}`);

        if (!isConsecutivelyAbsent) {
            // console.log(`[ABSENTEE DEBUG] Condition not met. Not sending email.`);
            return false;
        }

        const subject = "Attendance Alert: Consecutive Absences";
        const body = `Dear ${student.name},

We noticed that you have missed the last 3 consecutive mentorship sessions. Your attendance is critical for your progress in the program.

Please contact your mentor immediately to discuss your situation and ensure you don't fall further behind.

Best regards,
Student Tracker Team`;

        // console.log(`[ABSENTEE DEBUG] Sending email to ${student.email}`);
        const emailSent = await sendEmail([student.email], subject, body);
       //  console.log(`[ABSENTEE DEBUG] Email send result: ${emailSent}`);
        return emailSent;

    } catch (error) {
       // console.error("[ABSENTEE DEBUG] Error in checkAndSendAbsenteeWarning:", error);
        return false;
    }
};
