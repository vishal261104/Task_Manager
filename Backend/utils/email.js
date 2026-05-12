import nodemailer from "nodemailer";
import { logger } from "./logger.js";

const buildTransporter = () => {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = port === 465;

  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    throw new Error("Missing SMTP_USER or SMTP_PASS");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
};

export const sendEmail = async ({ to, subject, text, html }) => {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  if (!from) throw new Error("Missing SMTP_FROM");

  const transporter = buildTransporter();
  const payload = { from, to, subject, text, html };

  try {
    const info = await transporter.sendMail(payload);
    logger.info("Email sent", { to, subject, messageId: info?.messageId });
    return info;
  } catch (error) {
    logger.error("Email send failed", { to, subject, message: error?.message });
    throw error;
  }
};
