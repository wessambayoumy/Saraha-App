import nodemailer from "nodemailer";
import { env } from "../../config/env.service.js";

export const sendEmail = async (to: string, subject: string, text: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: env.emailUser,
      pass: env.emailPass,
    },
  });

  await transporter.sendMail({
    from: env.emailUser,
    to,
    subject,
    text,
  });
};
