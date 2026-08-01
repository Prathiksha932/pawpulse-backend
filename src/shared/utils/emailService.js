import nodemailer from 'nodemailer';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';

const isEmailConfigured = env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD;

const transporter = isEmailConfigured
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD },
    })
  : null;

export const sendEmail = async ({ to, subject, html }) => {
  if (!isEmailConfigured) {
    logger.info(`Email not configured — would have sent to ${to}: "${subject}"`);
    return;
  }
  try {
    await transporter.sendMail({ from: env.EMAIL_FROM, to, subject, html });
  } catch (error) {
    logger.error(`Failed to send email to ${to}: ${error.message}`);
  }
};

export const sendVerificationEmail = async (email, fullName, rawToken) => {
  const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email/${rawToken}`;
  await sendEmail({
    to: email,
    subject: 'Verify your PawPulse account',
    html: `<p>Hi ${fullName},</p><p>Please verify your email: <a href="${verifyUrl}">${verifyUrl}</a></p>`,
  });
};