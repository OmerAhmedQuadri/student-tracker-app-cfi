import nodemailer from "nodemailer";
import { env } from "../config/env";

const transporter = nodemailer.createTransport({
    host: env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(env.EMAIL_PORT || "587"),
    secure: env.EMAIL_SECURE === "true", // true for 465, false for other ports
    auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS,
    },
});

export const sendEmail = async (to: string[], subject: string, body: string) => {
    // console.log(`[EMAIL DEBUG] Attempting to send email to: ${to.join(", ")}`);
    // console.log(`[EMAIL DEBUG] Config: Host=${env.EMAIL_HOST}, Port=${env.EMAIL_PORT}, User=${env.EMAIL_USER ? 'Set' : 'Not Set'}`);

    try {
        const mailOptions = {
            from: env.EMAIL_FROM || '"Student Tracker Manager" <no-reply@studenttracker.com>',
            to: to.join(", "),
            subject: subject,
            text: body,
        };

        const info = await transporter.sendMail(mailOptions);
       // console.log("[EMAIL DEBUG] Message sent: %s", info.messageId);
        return true;
    } catch (error) {
       // console.error("[EMAIL DEBUG] Error sending email:", error);
        return false;
    }
};
