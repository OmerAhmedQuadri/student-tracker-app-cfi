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
    try {
        const mailOptions = {
            from: env.EMAIL_FROM || '"Student Tracker Manager" <no-reply@studenttracker.com>',
            to: to.join(", "), // Join array of emails into a string
            subject: subject,
            text: body,
            // html: "<b>Hello world?</b>", // html body
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Message sent: %s", info.messageId);
        return true;
    } catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
};
