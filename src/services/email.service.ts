import nodemailer from 'nodemailer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import env from '../config/env';
import { formatDuration } from '../utils/time-utils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const transporter = nodemailer.createTransport({
  host: env.emailHost,
  port: env.emailPort,
  secure: false, // true for 465, false for other ports
  auth: {
    user: env.emailUser,
    pass: env.emailPassword,
  },
});

const loadEmailTemplate = async (templateName: string, variables: Record<string, string>): Promise<string> => {
  const templatePath = path.join(__dirname, '..', 'views', 'emails', `${templateName}.html`);
  let template = await fs.readFile(templatePath, 'utf-8');

  // Replace all variables in the template
  Object.entries(variables).forEach(([key, value]) => {
    template = template.replace(new RegExp(`{{${key}}}`, 'g'), value);
  });

  return template;
};

const sendResetPasswordEmail = async (email: string, resetToken: string) => {
  const resetUrl = `${env.frontendUrl}/reset-password?token=${resetToken}`;

  const html = await loadEmailTemplate('reset-password', { resetUrl });

  const mailOptions = {
    from: env.emailFrom,
    to: email,
    subject: 'Reset Password Request',
    html,
  };

  await transporter.sendMail(mailOptions);
};

const sendVerificationEmail = async (email: string, verificationToken: string) => {
  const verificationUrl = `${env.frontendUrl}/verify-email?token=${verificationToken}`;
  const expiryTime = formatDuration(env.emailVerificationTokenExpiry);

  const html = await loadEmailTemplate('verify-email', {
    verificationUrl,
    expiryTime,
  });

  const mailOptions = {
    from: env.emailFrom,
    to: email,
    subject: 'Verify Your Email Address',
    html,
  };

  await transporter.sendMail(mailOptions);
};

const emailService = {
  sendResetPasswordEmail,
  sendVerificationEmail,
};

export default emailService;
